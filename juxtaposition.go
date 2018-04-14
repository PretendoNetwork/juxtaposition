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
	"time"
	// externals
	"gopkg.in/yaml.v2"
	// not used right now
	// "flag"
	// "os"
)

// startup function
// (might be moved into another file)
func startup(channel chan<- map[string]string) {

	// create holder variable for all configs
	var confs map[string]map[string]interface{}

	// load the main config
	channel <- map[string]string{"cur": "loading main config", "prev": "none"}

	// get the file data
	confByte := readFileByte("configs/main.yaml")

	// parse it to yaml
	err := yaml.Unmarshal(confByte, &confs["main"])

	// check for errors
	if err != nil {

		// show a message
		fmt.Printf("[err]: there is an error in your yaml in the configs/main.yaml file...\n")

		// and show a traceback
		panic(err)

	}

	// begin loading communities
	channel <- map[string]string{"cur": "loading communities", "prev": "success"}

	// get file data of the community config
	communityConfigByte := readFileByte("configs/communities.yaml")

	// parse it
	err = yaml.Unmarshal(communityConfigByte, &confs["communities"])

	// handle errors
	if err != nil {

		// show a message
		fmt.Printf("[err]: there is an error in your yaml in the config/communities.yaml file...\n")

		// and show a traceback
		panic(err)

	}
	
	// show that we have finished
	channel <- map[string]string{"cur": "finished", "prev": "success"}

}

// main function
func main() {

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
	go startup(channel)

	// message variable
	var message string

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
