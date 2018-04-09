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
)

// main function
func main() {

	// reset term colors
	consoleSequence(fmt.Sprintf("%s", code("reset")))

	// set window title
	ttitle("juxtaposition")

	
	
}
