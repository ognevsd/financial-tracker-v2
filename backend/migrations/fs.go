package migrations

import "embed"

// fs stands for file structure
// this file is reserved for compilation to binary. We're going to tell that
// there are bunch of SQL files here and when we will be running goose, it will
// refer to this file structure

//go:embed *.sql
var FS embed.FS
