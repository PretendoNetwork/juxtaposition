#!/bin/bash
# 
# juxtaposition/build.sh
# 
# juxtaposition's buildscript
# 
# written by superwhiskers, licensed under gnu agpl.
# if you want a copy, go to http://www.gnu.org/licenses/
#

# lists holding the possible arch and os combos
# example for a new entry: `os:arch`
# please keep this organized. thanks!
targets=(
    "windows:386"
    "windows:amd64"
    "linux:arm"
    "linux:arm64"
    "linux:386"
    "linux:amd64"
    "darwin:386"
    "darwin:amd64"
)

# get the bash script directory so nothing is screwed up
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# then fix the running directory
cd $dir

# function to show help
buildsh_show_help () {

    # show it
    echo 
    echo "build.sh [ release | dev | run | clean ] [ -h | --help ] [ -c | --cross-compile ]"
    echo 
    echo "sets up and builds juxtaposition"
    echo 
    echo "options:"
    echo 
    echo "    -h | --help             shows this"
    echo "    -c | --cross-compile    when a compilation argument is"
    echo "                            specified, cross compile it"
    echo 
    echo "arguments:"
    echo
    echo "    release                 build a release package (production)"
    echo "    dev                     build a development package"
    echo "    run                     run the program directly"
    echo "                            (configuration to use goes in the run-configuration directory)"
    echo "    clean                   clean the build environment"
    echo 

}

# function to clean the build environment
buildsh_clean () {

    # show a message telling what we are doing
    echo "cleaning the build environment..."
    
    # clean the build environment
    rm -rf build.conf.go build
    
    # to be continued

}

# option and argument variables
args_release=0
args_clean=0
args_dev=0
args_run=0
opts_cross_compile=0

# check for args and help option on first argument
if [[ "$1" == "release" ]]; then

    # set the release argument
    args_release=1

elif [[ "$1" == "clean" ]]; then

    # set the clean argument
    args_clean=1

elif [[ "$1" == "dev" ]]; then

    # set the dev argument
    args_dev=1

elif [[ "$1" == "run" ]]; then

    # set the run argument
    args_run=1

elif [[ "$1" == "-h" || "$1" == "--help" ]]; then

    # show help
    buildsh_show_help
    exit 1

else

    # show an error message, help, and then exit
    echo "unknown parameter passed for the argument: $1"
    buildsh_show_help
    exit 1

fi

# handle second options
if [[ "$2" == "--cross-compile" || "$2" == "-c" ]]; then

    # set the cross compile option
    opts_cross_compile=1

elif [[ "$2" == "--help" || "$2" == "-h" ]]; then

    # show help
    buildsh_show_help
    exit 1

else

    if [[ "$2" != "" ]]; then

        # show an error message, help, and then exit
        echo "unknown parameter passed for second option: $2"
        buildsh_show_help
        exit 1

    fi

fi

# handle third options
if [[ "$3" == "--cross-compile" || "$3" == "-c" ]]; then

    # set cross compile option
    opts_cross_compile=1

elif [[ "$3" == "--help" || "$3" == "-h" ]]; then

    # show help
    buildsh_show_help
    exit 1

else

    if [[ "$3" != "" ]]; then

        # show an error message, help, and then exit
        echo "unknown parameter passed for third option: $3"
        buildsh_show_help
        exit 1

    fi

fi

# do check on arguments since only one can be passed at a time
if [[ "$args_release" == 1  ]]; then
	
	# make sure no other args are specified
	if [[ "$args_clean" == 1 || "$args_dev" == 1 || "$args_run" == 1 ]]; then
		
		# show help if others are
		echo "only one argument may be specified at a time..."
		buildsh_show_help
		exit 1

	fi

elif [[ "$args_clean" == 1 ]]; then

	# make sure no other args are specified
	if [[ "$args_release" == 1 || "$args_dev" == 1 || "$args_run" == 1 ]]; then

		# show help if others are
		echo "only one argument may be specified at a time..."
		buildsh_show_help
		exit 1

	fi

elif [[ "$args_dev" == 1 ]]; then

	# make sure no others are specified
	if [[ "$args_release" == 1 || "$args_clean" == 1 || "$args_run" == 1 ]]; then

		# show help if others are
		echo "only one argument may be specified at a time..."
		buildsh_show_help
		exit 1

	fi

elif [[ "$args_run" == 1 ]]; then

	# make sure no others are specified
	if [[ "$args_release" == 1 || "$args_clean" == 1 || "$args_dev" == 1 ]]; then

		# show help if others are
		echo "only one argument may be specified at a time..."
		buildsh_show_help
		exit 1

	fi

else

	# tell them they must have an argument
	echo "you must have at least one argument passed..."
	buildsh_show_help
	exit 1

fi

# release build
if [[ "$args_release" == 1 || "$args_dev" == 1 || "$args_run" == 1 ]]; then

    # clean the build environment
    buildsh_clean

    # show a message telling what we are doing
    echo "copying config file..."
    
    # release build
    if [ "$args_release" == 1 ]; then

        # select the appropriate build config to
        # use
        cp buildconfs/build.prod.go build.conf.go >/dev/null 2>/dev/null
        
        # get the exit code
        extcode=$?
    
    # development build
    elif [[ "$args_dev" == 1 || "$args_run" == 1 ]]; then

        # select the appropriate build
        # config to use
        cp buildconfs/build.devel.go build.conf.go >/dev/null 2>/dev/null
        
        # get the exit code
        extcode=$?
    
    fi

    # if an error occured from the cp command...
    if [ "$extcode" != 0 ]; then
        
        # show an error message and the exit code
        echo "an error occured while copying the config"
        echo "check if the buildconfs directory exists, and if build.prod.go exists..."
        echo "exit code of cp: $extcode"
        exit
    
    fi

    # cross-compilation handling
    if [ "$2" == "--cross-compile" ]; then

        # create the build directory
        mkdir build

        # send them a message telling them what we are doing
        echo "compiling $1 build for multiple oses..."

        # start cross compilation
        for targetstr in "${targets[@]}"; do

            # get the target
            IFS=':' read -r -a target <<< "$targetstr"

            # tell the user what we are compiling for
            echo 
            echo "new target:"
            echo "  os: ${target[0]}"
            echo "  arch: ${target[1]}"
            echo
            
            # add the .exe extension for windows
            if [ "${target[0]}" == "windows" ]; then

                # compile it for that windows with that arch
                env GOOS=${target[0]} GOARCH=${target[1]} go build -o "build/juxtaposition-${target[0]}-${target[1]}.exe"

            # any other os/arch combo
            else
            
                # compile it for that os and arch
                env GOOS=${target[0]} GOARCH=${target[1]} go build -o "build/juxtaposition-${target[0]}-${target[1]}"

            fi
        
        done
    
    # running the program directly
    elif [ "$args_run" == 1 ]; then
        
	    # let them know we're running it
        echo "running the program for host os..."
	
	    # run it
    	go run *.go --configDirectory run-configuration

    # compiling the program for only your system
    else

        # create the build directory
        mkdir build

        # send a message letting the user know that we have started compiling
        echo "compiling $1 build for host os..."

        # run the build command
        go build -o build/juxtaposition
    
    fi

    # to be continued

# clean the environment
elif [ "$args_clean" == 1 ]; then
    
    # run the clean function
    buildsh_clean

# show help
else

    # function to show help
    buildsh_show_help

fi
