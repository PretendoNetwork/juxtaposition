/*

juxtaposition/fs.go

utilities for the file and filesystem

written by superwhiskers, licensed under gnu agpl.
if you want a copy, go to http://www.gnu.org/licenses/

*/

package main

import (
	// internals
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// create directory
func makeDirectory(directory string) {

	// make the directory
	err := os.MkdirAll(directory, 0755)

	// error handling
	if err != nil {

		// show error message
		fmt.Printf("[err]: error while creating directory (does it already exist?)")

		// show traceback
		panic(err)

	}

}

func doesDirExist(dir string) bool {
	
	// check if directory exists
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		
		// if it doesn't
		return false
		
	}
	
	// if it does
	return true
	
}

// check if file exists
func doesFileExist(file string) bool {

	// this gets the absolute path of the file
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))

	// this tells the program if it exists
	_, err = os.Stat(strings.Join([]string{dir, "/", file}, ""))

	// handle any errors
	if err != nil {

		// return false if it doesn't exist
		return false

	}

	// then return true if it exists
	return true

}

// create a file
func createFile(file string) {

	// detect if file already exists
	if doesFileExist(file) == true {

		// display something if it already does
		fmt.Printf("[err] : %s already exists..", file)

		// then exit the program because you should already know if it does
		os.Exit(1)

	}

	// create the file
	oput, err := os.Create(file)

	// handle any errors
	if err != nil {

		// display an error message
		fmt.Printf("[err] : error creating file %s.. (does it already exist?)\n", file)

		// close the file stream
		defer oput.Close()

		// show a traceback
		panic(err)

	}

	// close it if done writing
	defer oput.Close()

}

// read a file, output a byte
func readFileByte(file string) []byte {

	// read file
	b, err := ioutil.ReadFile(file)

	// handle errors
	if err != nil {

		// display error message
		fmt.Printf("[err] : error reading file %s.. (does it exist?)\n", file)

		// show traceback
		panic(err)

	}

	// return the byte array
	return b

}

// read a file, output data as string
func readFile(file string) string {

	// read the file with my other function
	b := readFileByte(file)

	// convert byte array to string
	str := string(b)

	// return the string
	return str

}

// delete a file
func deleteFile(file string) {

	// delete the file
	err := os.Remove(file)

	// handle errors
	if err != nil {

		// show error message
		fmt.Printf("[err] : error deleting file %s..", file)

		// show traceback
		panic(err)

	}

}

// write to file
func writeFile(file string, data string) {

	// convert string to byte array
	bdata := []byte(data)

	// write to file
	err := ioutil.WriteFile(file, bdata, 0644)

	// handle errors
	if err != nil {

		// show error message
		fmt.Printf("[err] : error writing to file %s.. (does it exist?)\n", file)

		// show traceback
		panic(err)

	}

}

// write byte to file
func writeByteToFile(file string, data []byte) {

	// write to file
	err := ioutil.WriteFile(file, data, 0644)

	// handle errors
	if err != nil {

		// show error message
		fmt.Printf("[err] : error writing to file %s.. (does it exist?)\n", file)

		// show traceback
		panic(err)

	}

}

// check if file is valid JSON
func checkJSONValidity(file string) bool {

	// get JSON from file
	filedata := []byte(readFile(file))

	// this only exists because it's required to unmarshal the file
	var data map[string]interface{}

	// unmarshal the file
	err := json.Unmarshal(filedata, &data)

	// check for errors
	if err != nil {

		// return false if there is one
		return false

	}

	// return true if there isn't one
	return true

}

// read a JSON file
func readJSONFile(file string) map[string]interface{} {

	// get json from file, and turn into byte array
	jsonObj := []byte(readFile(file))

	// initialize an interface
	var data map[string]interface{}

	// turn json into a valid golang item
	err := json.Unmarshal(jsonObj, &data)

	// handle errors
	if err != nil {

		// show error message
		fmt.Printf("[err] : error converting raw JSON to valid golang item from %s.. (is this valid JSON?)\n", file)

		// show traceback
		panic(err)

	}

	// return the golang item
	return data

}

// write to a json file
func writeJSONFile(file string, data map[string]int) {

	// turn go map into valid JSON
	fileData, err := json.Marshal(data)

	// handle errors
	if err != nil {

		// show error message
		fmt.Printf("[err] : error while converting a golang map into JSON. (how did this even happen)\n")

		// show traceback
		panic(err)

	}

	// convert to string
	sFileData := string(fileData)

	// write it to a file
	writeFile(file, sFileData)

}
