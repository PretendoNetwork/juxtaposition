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
    echo "build.sh [ release | dev | clean ] [ -h | --help ] [ --cross-compile ]"
    echo 
    echo "sets up and builds juxtaposition"
    echo 
    echo "options:"
    echo 
    echo "    -h | --help         shows this"
    echo "    --cross-compile     when a compilation argument is"
    echo "                        specified, cross compile it"
    echo 
    echo "arguments:"
    echo
    echo "    release         build a release package (production)"
    echo "    dev             build a development package"
    echo "    clean           clean the build environment"
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

# check if we need to show help
if [[ "$*" = *"-h"* || "$*" = *"--help"* ]]; then

    # show help
    buildsh_show_help

# release build
elif [[ "$1" == "release" || "$1" == "dev" ]]; then

    # clean the build environment
    buildsh_clean

    # show a message telling what we are doing
    echo "copying config file..."
    
    # release build
    if [ "$1" == "release" ]; then

        # select the appropriate build config to
        # use
        cp buildconfs/build.prod.go build.conf.go >/dev/null 2>/dev/null
        
        # get the exit code
        extcode=$?
    
    # development build
    elif [ "$1" == "dev" ]; then

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

    # create the build directory
    mkdir build

    # cross-compilation handling
    if [ "$2" == "--cross-compile" ]; then

        # send them a message telling them what we are doing
        echo "compiling $1 build for multiple oses..."

        # start cross compilation
        for targetstr in "${targets[@]}"
        do

            # get the target
            IFS=':' read -r -a target <<< "$targetstr"

            # tell the user what we are compiling for
            echo 
            echo "new target:"
            echo "  os: ${target[0]}"
            echo "  arch: ${target[1]}"
            echo

            # -buildmode=pie is only supported on linux
            if [ "${target[0]}" == "linux" ]; then

                # compile it for that linux with that arch
                env GOOS=${target[0]} GOARCH=${target[1]} go build -buildmode=pie -o "build/juxtaposition-${target[0]}-${target[1]}"
            
            # add the .exe extension for windows
            elif [ "${target[0]}" == "windows" ]; then

                # compile it for that windows with that arch
                env GOOS=${target[0]} GOARCH=${target[1]} go build -o "build/juxtaposition-${target[0]}-${target[1]}.exe"

            # any other os/arch combo
            else
            
                # compile it for that os and arch
                env GOOS=${target[0]} GOARCH=${target[1]} go build -o "build/juxtaposition-${target[0]}-${target[1]}"

            fi
        
        done

    else

        # send a message letting the user know that we have started compiling
        echo "compiling $1 build for host os..."

        # run the build command
        go build -buildmode=pie -o build/juxtaposition
    
    fi

    # to be continued

# clean the environment
elif [ "$1" == "clean" ]; then
    
    # run the clean function
    buildsh_clean

# show help
else

    # function to show help
    buildsh_show_help

fi
