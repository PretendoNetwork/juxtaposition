/*

juxtaposition/utils.go

utilities for things like json

written by superwhiskers, licensed under gnu agpl.
if you want a copy, go to http://www.gnu.org/licenses/

*/

package main

import (
	// internals
	"fmt"
	"net"
	"reflect"
)

// get the ip address of the machine
func getIP() string {

	// dial a connection to another ip
	conn, err := net.Dial("udp", "8.8.8.8:80")
	
	// handle errors
	if err != nil {
		
		// show error message
		fmt.Printf("[err]: error while connecting to another computer\n")
		
		// show traceback
		panic(err)
		
	}
	
	// close the connection once dobs
	defer conn.Close()

	// get the local address
	localAddr := conn.LocalAddr().(*net.UDPAddr)

	// return it
	return localAddr.IP.String()
	
}

}

// function for zeroing something
// takes a pointer (&varible)
func erase(v interface{}) {

	// get the pointer
	p := reflect.ValueOf(v).Elem()

	// zero it
	p.Set(reflect.Zero(p.Type()))

}
