/*

juxtaposition/juxtaposition.go

written by superwhiskers, licensed under gnu agpl.
if you want a copy, go to http://www.gnu.org/licenses/

*/

package main

import (
	// internals
	"fmt"
	"strings"
	"os"
	"flag"
	// externals
	"gopkg.in/yaml.v2"
)

// startup function
// (might be moved into another file)
func startup(confFolder string, channel chan<- map[string]string) {

	// create holder variable for all configs
	confs := make(map[string]map[string]interface{})

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
		fmt.Printf("[err]: there is an error in your yaml in the %s/main.yaml file...\n", confFolder)

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
		fmt.Printf("[err]: there is an error in your yaml in the %s/communities.yaml file...\n", confFolder)

		// and show a traceback
		panic(err)

	}

	// move it in
	confs["communities"] = tmpconf
	
	// show that we have finished
	channel <- map[string]string{"cur": "finished", "prev": "success"}

}

// main function
func main() {

	// parse flags
	confFolder := flag.String("configDirectory", "configs", "value for config file path (default is configs)")
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
			consoleSequence(strings.Join([]string{ padStrToMatchStr(fmt.Sprintf("\rstarting up (finished, result of last: %s).", message["prev"]), lastmsg, " "), "\n" }, ""))

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

}
