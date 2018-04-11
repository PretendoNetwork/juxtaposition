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
	// not used right now
	// "flag"
	// "os"
)

// startup function
// (might be moved into another file)
func startup(channel chan<- string) {

	// test
	channel <- "test"
        time.Sleep(2 * time.Second)
	channel <- "another test"
        time.Sleep(2 * time.Second)
	channel <- "finished"

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
	channel := make(chan string)

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
		if message == "finished" {

			// is done
			consoleSequence(strings.Join([]string{ padStrToMatchStr(fmt.Sprintf("\rstarting up (finished)."), lastmsg, " "), "\n" }, ""))

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
		curmsg = fmt.Sprintf("\rstarting up (current phase: %s)%s", message, strings.Repeat(".", dots))
		
		// display the data in the message
		consoleSequence(padStrToMatchStr(curmsg, lastmsg, " "))

		// set the last message
		lastmsg = curmsg

	}

}
