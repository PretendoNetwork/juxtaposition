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
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// create directory
func makeDirectory(directory string) error {

	// make the directory
	err := os.MkdirAll(directory, 0755)

	// error handling
	if err != nil {

		return err

	}

	// return no error
	return nil

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
func createFile(file string) error {

	// create the file
	oput, err := os.Create(file)

	// close the file stream when done with it
	defer oput.Close()

	// handle any errors
	if err != nil {

		// yeah, you have an error
		return err

	}

	// return no error
	return nil

}

// read a file, output a byte
func readFileByte(file string) ([]byte, error) {

	// read file
	b, err := ioutil.ReadFile(file)

	// handle errors
	if err != nil {

		return nil, err

	}

	// return the byte array
	return b, nil

}

// read a file, output data as string
func readFile(file string) (string, error) {

	// read the file with my other function
	b, err := readFileByte(file)

	// convert byte array to string
	str := string(b)

	// return the string
	return str, err

}

// delete a file
func deleteFile(file string) error {

	// delete the file
	err := os.Remove(file)

	// handle errors
	if err != nil {

		// return it
		return err

	}

	// return no error
	return nil

}

// write to file
func writeFile(file string, data string) error {

	// convert string to byte array
	bdata := []byte(data)

	// write to file
	err := ioutil.WriteFile(file, bdata, 0644)

	// handle errors
	if err != nil {

		// return it
		return err

	}

	// return no error
	return nil

}

// write byte to file
func writeByteToFile(file string, data []byte) error {

	// write to file
	err := ioutil.WriteFile(file, data, 0644)

	// handle errors
	if err != nil {

		// return it
		return err

	}

	// return no error
	return nil

}

// check if file is valid JSON
func checkJSONValidity(file string) (bool, error) {

	// get bytes from file
	filedata, err := readFile(file)

	// file doesn't exist
	if err != nil {

		// return error
		return false, err

	}

	// convert to byte
	filebyte := []byte(filedata)

	// this only exists because it's required to unmarshal the file
	var data map[string]interface{}

	// unmarshal the file
	err = json.Unmarshal(filebyte, &data)

	// check for errors
	if err != nil {

		// return false if there is one
		return false, nil

	}

	// return true if there isn't one
	return true, nil

}

// read a JSON file
func readJSONFile(file string) (map[string]interface{}, error) {

	// get json from file, and turn into byte array
	byteObj, err := readFile(file)

	// check for errors
	if err != nil {

		// if so, return it
		return nil, err

	}

	// convert it to byte array
	jsonObj := []byte(byteObj)

	// initialize an interface
	var data map[string]interface{}

	// turn json into a valid golang item
	err = json.Unmarshal(jsonObj, &data)

	// handle errors
	if err != nil {

		// return it
		return nil, err

	}

	// return the golang item
	return data, nil

}

// write to a json file
func writeJSONFile(file string, data map[string]int) error {

	// turn go map into valid JSON
	fileData, err := json.Marshal(data)

	// handle errors
	if err != nil {

		// return it
		return err

	}

	// convert to string
	sFileData := string(fileData)

	// write it to a file
	writeFile(file, sFileData)

	// return no error
	return nil

}
