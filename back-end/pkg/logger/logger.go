package logger

import (
	"log"
	"time"
)

type LogEntry struct {
	OriginService string
	ActionType    string
	Description   string
	OriginIP      string
	ResultStatus  string
	UserID        string
}

type Logger struct{}

func NewLogger() *Logger {
	return &Logger{}
}

func (l *Logger) Log(entry LogEntry) {
	log.Printf("[%s] [%s] [%s] %s | IP: %s | UserID: %s",
		time.Now().Format(time.RFC3339),
		entry.ResultStatus,
		entry.ActionType,
		entry.Description,
		entry.OriginIP,
		entry.UserID,
	)
}
