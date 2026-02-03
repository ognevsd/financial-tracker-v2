package utils

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// another option of doing any is interface{}
type Envelope map[string]any

func WriteJSON(w http.ResponseWriter, status int, data Envelope) error {
	js, err := json.Marshal(data)
	if err != nil {
		return err
	}
	js = append(js, '\n')
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(js)
	return nil
}

func ReadIdParam(r *http.Request) (string, error) {
	idParam := chi.URLParam(r, "id")
	if idParam == "" {
		return "", errors.New("Invalid id parameter")
	}

	return idParam, nil
}

func ErrorPayload(errorMessage string) Envelope {
	return Envelope{"error": errorMessage}
}

func StringPtr(s string) *string {
	return &s
}
