package models

type Field struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	OrderIndex int    `json:"orderIndex"`
	Values     map[int]*int
}

type Section struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	OrderIndex int64     `json:"orderIndex"`
	Sections   []Section `json:"sections"`
	Fields     []Field   `json:"fields"`
}

type Report struct {
	ID string `json:"id"`
	// Name     string    `json:"name"`
	Years    []int64   `json:"years"`
	Sections []Section `json:"sections"`
}

type LayoutField struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	OrderIndex int64  `json:"orderIndex"`
}

type LayoutSection struct {
	ID         string          `json:"id"`
	Name       string          `json:"name"`
	OrderIndex int64           `json:"orderIndex"`
	Sections   []LayoutSection `json:"sections"`
	Fields     []Field         `json:"fields"`
}

type Layout []LayoutSection
