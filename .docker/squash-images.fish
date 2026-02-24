#!/usr/bin/fish

# Shitty image opt script
# Delete once we have proper stuff

source (which env_parallel.fish)

set files (find . -name '*.png' -print0 | string split0)

echo Will process (count $files) images.

function process
    oxipng -o max --zopfli --zi 50 --ng --strip all $argv
    ect -9 -strip --allfilters-b $argv
end

env_parallel --env process process ::: $files