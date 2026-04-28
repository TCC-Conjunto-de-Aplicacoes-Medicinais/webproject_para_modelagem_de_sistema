package database

import (
	"fmt"
	"log"

	"openhealth/pkg/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectMariaDB(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBCharset,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to MariaDB successfully!")
	return db
}
