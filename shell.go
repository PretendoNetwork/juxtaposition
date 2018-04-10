/*

juxtaposition/shell.go

shell interaction

written by superwhiskers, licensed under gnu agpl.
if you want a copy, go to http://www.gnu.org/licenses/

*/

package main

import (
	// internals
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"
	// externals
	"github.com/shiena/ansicolor"
)


/* terminal utils */

// function to clear the screen
func clear() {

	// detect if the host OS is Windows
	if runtime.GOOS == "windows" {

		// if it is, then use the native `cls` command to
		// clear the screen
		cmd := exec.Command("cmd", "/c", "cls")

		// because of the way things work, we have to pipe output
		// directly to the main stdout
		cmd.Stdout = os.Stdout

		// then run the command
		err := cmd.Run()

		// handle errors correctly
		if err != nil {
			
			// show a message
			fmt.Printf("[err] : error while executing cls. (report this issue)\n")
		
			// show traceback
			panic(err)
			
		}

	} else {

		// if it is some ANSI escape code respecive OS,
		// use the clear code
		fmt.Printf("\033[2J\033[;H")

	}
	
}

// trick Terminal.app to respect ANSI color codes
func ansiTrick() {

	// run the export command to set the terminal type to
	// an escape code respective term
	// (i'm not even sure if this works)
	cmd := exec.Command("export", "TERM=xterm")

	// run the command
	err := cmd.Run()

	// handle errors correctly
	if err != nil {
		
		// show an error message
		fmt.Printf("[err] : error while executing export. (isn't that a shell builtin?)\n")
		
		// show a traceback
		panic(err)
		
	}

}

// get terminal input
// (for the amount of times i have to get term input, i need this)
func input(prompt string) string {

	// print a prompt
	fmt.Printf(prompt)

	// create a scanner to get user input
	scanner := bufio.NewScanner(os.Stdin)

	// run the scanner
	scanner.Scan()

	// return the user-supplied input
	return scanner.Text()

}

// shorthand for len([]rune(x))
func length(x string) int {

	// something that is extremely
	// useful to have and use
	return len([]rune(x))

}

// pad string to match the length of another string
func padStrToMatchStr(pad string, match string, padWith string) string {

	// make sure the character to pad it is only 1 character
	if length(padWith) != 1 {

		// throw an error if it isn't
		fmt.Printf("[err] : '%s' is not 1 character long", padWith)
		os.Exit(1)

	}

	// pad the string to match the length of the other
	for x := 0; x < length(match); x++ {
		
		// pad the string with the character
		pad += padWith
		
	}

	// return the padded string
	return pad

}

// is it windows
func isWindows() bool {

	// shorthand for this since
	// i have to use windows specific code a lot
	return (runtime.GOOS == "windows")

}

/* give terminal style */

// set terminal title
func ttitle(title string) {

	// an easier way of setting term title
	// since doing this every time can be a pain
	fmt.Print(strings.Join([]string {"\033]0;",title,"\007"}, ""))

}

// output a formatted escape code for 8/16 bit color
func tcolor(cid int) string {

	// again, another shorthand for a complex
	// thing that can be a pain
	return strings.Join([]string {"\033[",string(cid),"m"}, "")

}

// terminal color codes
func code(index string) string {

	// map to store terminal codes
	var termCodes map[string]string
	var prefix string
	termCodes = make(map[string]string)

	// fix colors on Terminal.app
	if runtime.GOOS == "darwin" { ansiTrick(); }

	// fix prefix for windows
	if runtime.GOOS == "windows" {

		// prefix that the terminal
		// color lib uses
		prefix = "\x1b"

	} else {

		// standard octal code prefix
		prefix = "\033"

	}

	// codes go here

	// style
	termCodes["bold"] = "[1m"
	termCodes["reset"] = "[0m"
	termCodes["underline"] = "[4m"
	termCodes["dim"] = "[2m"
	termCodes["invert"] = "[7m"
	termCodes["hide"] = "[8m"

	// colors
	termCodes["grey"] = "[90m"
	termCodes["red"] = "[91m"
	termCodes["green"] = "[92m"
	termCodes["yellow"] = "[93m"
	termCodes["blue"] = "[94m"
	termCodes["magenta"] = "[95m"
	termCodes["cyan"] = "[96m"
	termCodes["white"] = "[97m"

	// output the correct terminal color code
	return strings.Join([]string {prefix,termCodes[index]}, "")

}

// function to send a colored console output to the terminal
func consoleSequence(message string) {

	// things are different for windows
	// *shrug*
	if runtime.GOOS == "windows" {

		// make that writer
		Writer := ansicolor.NewAnsiColorWriter(os.Stdout)

		// then output it to the term
		fmt.Fprintf(Writer, message)

	// if it isn't windows, assume you can
	// use standard ansi escapes
	} else {

		// just print it
		fmt.Printf(message)

	}
	
}
