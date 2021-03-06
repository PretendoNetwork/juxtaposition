/*

juxtaposition/juxtaposition.go

written by superwhiskers, licensed under gnu agpl.
if you want a copy, go to http://www.gnu.org/licenses/

*/

package main

import (
	// internals
	"flag"
	"fmt"
	"os"
	"strings"
	// externals
	"github.com/go-redis/redis"
	"github.com/gocql/gocql"
	"github.com/kristoiv/gocqltable"
	"gopkg.in/yaml.v2"
)

// configs
var confs map[string]map[string]interface{}

// the cassandra cluster, session, and keyspace
var cassCluster *gocql.ClusterConfig
var cassandra *gocql.Session
var cass gocqltable.Keyspace

// the redis client
var redisClient interface{}

// startup function
// (might be moved into another file)
func startup(confFolder string, channel chan<- map[string]string) {

	// create holder variable for all configs
	confs = make(map[string]map[string]interface{})

	// temporary variable for moving a config into the map
	var tmpconf map[string]interface{}

	// load the main config
	channel <- map[string]string{"cur": "loading main config", "prev": "none"}

	// get the file data
	confByte, err := readFileByte(fmt.Sprintf("%s/main.yaml", confFolder))

	// check for errors
	if err != nil {

		// show a message
		fmt.Printf("\n[err]: error while loading the config in %s/main.yaml.\n", confFolder)
		fmt.Printf("       you should copy main.example.yaml in/into that directory to a file\n")
		fmt.Printf("       in that directory named main.yaml.\n")

		// exit
		os.Exit(1)

	}

	// parse it to yaml
	err = yaml.Unmarshal(confByte, &tmpconf)

	// check for errors
	if err != nil {

		// show a message
		fmt.Printf("\n[err]: there is an error in your yaml in the %s/main.yaml file...\n", confFolder)

		// and show a traceback
		panic(err)

	}

	// move it in
	confs["main"] = tmpconf

	// begin loading communities
	channel <- map[string]string{"cur": "loading communities", "prev": "success"}

	// get file data of the community config
	communityConfigByte, nil := readFileByte(fmt.Sprintf("%s/communities.yaml", confFolder))

	// check for errors
	if err != nil {

		// show a message
		fmt.Printf("\n[err]: error while loading the config in %s/communities.yaml.\n", confFolder)
		fmt.Printf("       you should copy communities.example.yaml in/into that directory to a file\n")
		fmt.Printf("       in that directory named communities.yaml.\n")

		// exit
		os.Exit(1)

	}

	// parse it
	err = yaml.Unmarshal(communityConfigByte, &tmpconf)

	// handle errors
	if err != nil {

		// show a message
		fmt.Printf("\n[err]: there is an error in your yaml in the %s/communities.yaml file...\n", confFolder)

		// and show a traceback
		panic(err)

	}

	// move it in
	confs["communities"] = tmpconf

	// begin loading the server config in
	channel <- map[string]string{"cur": "loading servers", "prev": "success"}

	// get file data of the community config
	serverConfigByte, nil := readFileByte(fmt.Sprintf("%s/servers.yaml", confFolder))

	// check for errors
	if err != nil {

		// show a message
		fmt.Printf("\n[err]: error while loading the config in %s/servers.yaml.\n", confFolder)
		fmt.Printf("       you should copy servers.example.yaml in/into that directory to a file\n")
		fmt.Printf("       in that directory named servers.yaml.\n")

		// exit
		os.Exit(1)

	}

	// parse it
	err = yaml.Unmarshal(serverConfigByte, &tmpconf)

	// handle errors
	if err != nil {

		// show a message
		fmt.Printf("\n[err]: there is an error in your yaml in the %s/servers.yaml file...\n", confFolder)

		// and show a traceback
		panic(err)

	}

	// move it in
	confs["servers"] = tmpconf

	// begin loading the cassandra database in
	channel <- map[string]string{"cur": "connecting to database server (cassandra)", "prev": "success"}

	// perform a type assertion on some things that we need for this
	cassandraSettings := confs["main"]["cassandra"].(map[interface{}]interface{})
	cassandraAuth := cassandraSettings["authentication"].(map[interface{}]interface{})
	cassandraGeneral := cassandraSettings["general"].(map[interface{}]interface{})
	cassandraSSL := cassandraSettings["ssl"].(map[interface{}]interface{})
	clusterIPsInterface := cassandraGeneral["cluster"].([]interface{})
	keyspaceName := cassandraGeneral["keyspace"].(string)

	// copy every ip in the cluster to another slice
	// with the correct type

	// create the variable
	var clusterIPs []string

	// loop over the old slice
	for _, IP := range clusterIPsInterface {

		// copy over the ip
		clusterIPs = append(clusterIPs, IP.(string))

	}

	// first, we create a variable with the cluster
	cassCluster = gocql.NewCluster(clusterIPs...)

	// check if we need to add authentication
	if cassandraAuth["enabled"].(bool) == true {

		// add authentication
		cassCluster.Authenticator = gocql.PasswordAuthenticator{

			Username: cassandraAuth["username"].(string),
			Password: cassandraAuth["password"].(string),
		}

	}

	// check if we are using client cert authentication
	if cassandraSSL["enabled"].(bool) == true {

		// check if we are using a root ca
		if cassandraSSL["rootCA"].(string) != "" {

			// then use one
			cassCluster.SslOpts = &gocql.SslOptions{

				CertPath: cassandraSSL["certPath"].(string),
				KeyPath:  cassandraSSL["keyPath"].(string),
				CaPath:   cassandraSSL["rootCA"].(string),
			}

		} else {

			// otherwise, use one
			cassCluster.SslOpts = &gocql.SslOptions{

				CertPath: cassandraSSL["certPath"].(string),
				KeyPath:  cassandraSSL["keyPath"].(string),
			}

		}

	}

	// create a connection to that cluster
	cassandra, err = cassCluster.CreateSession()

	// check for errors
	if err != nil {

		// show error message
		fmt.Printf("\n[err]: error while connecting to the cassandra database...\n")
		fmt.Printf("       check if you are running a cassandra server at any of the ips:\n")
		fmt.Printf("       %v\n", clusterIPs)

		// exit the program
		os.Exit(1)

	}

	// load gocqltable
	gocqltable.SetDefaultSession(cassandra)

	// you should at least have this
	// keyspace created
	cass = gocqltable.NewKeyspace(keyspaceName)

	// set up redis
	channel <- map[string]string{"cur": "connecting to caching server (redis)", "prev": "success"}

	// perform needed type assertions
	redisSettings := confs["main"]["redis"].(map[interface{}]interface{})
	redisGeneral := redisSettings["general"].(map[interface{}]interface{})
	redisAuth := redisSettings["authentication"].(map[interface{}]interface{})
	redisClusterIPsInterface := redisGeneral["cluster"].([]interface{})
	redisPassword := redisAuth["password"].(string)
	redisDB := redisGeneral["db"].(int)

	// move over the cluster ips to a non-interface slice
	var redisClusterIPs []string

	// loop over the old slice
	for _, IP := range redisClusterIPsInterface {

		// copy over the ip
		redisClusterIPs = append(redisClusterIPs, IP.(string))

	}

	// check length of the cluster ips
	// and how to initiate them
	if len(redisClusterIPs) > 1 {

		// check if we're going to enable authentication
		if redisAuth["enabled"].(bool) == true {

			// enable it
			redisClient = redis.NewClusterClient(&redis.ClusterOptions{
				Addrs:    redisClusterIPs,
				Password: redisPassword,
			})

		} else {

			// keep it disabled
			redisClient = redis.NewClusterClient(&redis.ClusterOptions{
				Addrs: redisClusterIPs,
			})

		}

	} else {

		// check if we're going to enable authentication
		if redisAuth["enabled"].(bool) == true {

			// enable it
			redisClient = redis.NewClient(&redis.Options{
				Addr:     redisClusterIPs[0],
				Password: redisPassword,
				DB:       redisDB,
			})

		} else {

			// keep it disabled
			redisClient = redis.NewClient(&redis.Options{
				Addr: redisClusterIPs[0],
				DB:   redisDB,
			})

		}

	}

	// show that we have finished
	channel <- map[string]string{"cur": "finished", "prev": "success"}

}

// main function
func main() {

	// parse flags
	confFolder := flag.String("configDirectory", "configs", "value for config file path (default is configs)")
	rootFolder := flag.String("rootDirectory", "", "value for root directory (default is the current one)")
	flag.Parse()

	// reset term colors
	consoleSequence(fmt.Sprintf("%s", code("reset")))

	// show a welcome message to be friendly
	consoleSequence(fmt.Sprintf("\n%s%s%s%s by %s%ssuperwhiskers%s\n", code("reset"), code("magenta"), progName, code("reset"), code("bold"), code("magenta"), code("reset")))
	consoleSequence(fmt.Sprintf("version: %sv%s%s\n", code("green"), curVer, code("reset")))
	fmt.Printf("----\n\n")

	// show a loading message
	fmt.Printf("starting up...")

	// create a communications channel
	channel := make(chan map[string]string)

	// start the load goroutine
	go startup(*confFolder, channel)

	// message variable
	var message map[string]string

	// dot counter
	var dots int

	// last message so we can pad
	var lastmsg string

	// current message
	var curmsg string

	// wait for the startup phases to finish
	for true {

		// wait for a message to pass through
		message = <-channel

		// exit the loop if it is done
		if message["cur"] == "finished" {

			// is done
			consoleSequence(strings.Join([]string{padStrToMatchStr(fmt.Sprintf("\rstarting up (finished, result of last: %s).", message["prev"]), lastmsg, " "), "\n"}, ""))

			// exit it
			break

		}

		// do dot display
		if dots != 4 {

			// increment dots
			dots++

		} else {

			// reset dots
			dots = 1

		}

		// get the current message
		curmsg = fmt.Sprintf("\rstarting up (current phase: %s, result of last: %s)%s", message["cur"], message["prev"], strings.Repeat(".", dots))

		// display the data in the message
		consoleSequence(padStrToMatchStr(curmsg, lastmsg, " "))

		// set the last message
		lastmsg = curmsg

	}

	// check if we are running in a development environment
	if serverEnv == "devel" {

		// let them know we are in a development environment
		consoleSequence(fmt.Sprintf("\n%s%s~~ warning! this server is running in in development mode. please do not use this in prodution :3 ~~%s\n\n", code("reset"), code("red"), code("reset")))

	}

	// now we start the server
	server(rootFolder)

}
