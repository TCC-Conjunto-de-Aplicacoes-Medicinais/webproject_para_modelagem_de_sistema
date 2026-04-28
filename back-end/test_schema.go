package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "usr_core:Teste@01@tcp(129.121.46.16:3306)/sistema_core")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	rows, err := db.Query("DESCRIBE clinics;")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var field, typ, null, key, extra string
		var def sql.NullString
		if err := rows.Scan(&field, &typ, &null, &key, &def, &extra); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Field: %s, Type: %s, Null: %s, Default: %v\n", field, typ, null, def.String)
	}
}
