package store

import (
	"database/sql"

	"github.com/google/uuid"
)

type Asset struct {
	Id                     string `json:"id"`
	Ticker                 string `json:"ticker"`
	Name                   string `json:"name"`
	AssetTypeId            string `json:"assetTypeId"`
	Industry               string `json:"industry"`
	Commodity              string `json:"commodity"`
	CurrencyId             string `json:"currencyId"`
	ReportingMultiplicator int    `json:"reportingMultiplicator"`
}

type SqliteAssetStore struct {
	db *sql.DB
}

func NewSqliteAssetStore(db *sql.DB) *SqliteAssetStore {
	return &SqliteAssetStore{db: db}
}

type AssetStore interface {
	AddAsset(*Asset) (*Asset, error)
	GetAllAssets() ([]*Asset, error)
}

func (store *SqliteAssetStore) AddAsset(asset *Asset) (*Asset, error) {
	query := `
	INSERT INTO asset (id, symbol, name, type, industry, commodity, currency_id, rep_multiplicator)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING (id)
	`
	newAssetId := uuid.New().String()
	err := store.db.QueryRow(
		query,
		newAssetId,
		asset.Ticker,
		asset.Name,
		asset.AssetTypeId,
		asset.Industry,
		asset.Commodity,
		asset.CurrencyId,
		asset.ReportingMultiplicator,
	).Scan(&asset.Id)
	if err != nil {
		return nil, err
	}
	return asset, nil
}

func (store *SqliteAssetStore) GetAllAssets() ([]*Asset, error) {
	query := `
	SELECT id, symbol, name, type, industry, commodity, currency_id, rep_multiplicator
	FROM asset
	`

	rows, err := store.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assets []*Asset

	for rows.Next() {
		asset := &Asset{}
		err := rows.Scan(
			asset.Id,
			asset.Ticker,
			asset.Name,
			asset.AssetTypeId,
			asset.Industry,
			asset.Commodity,
			asset.CurrencyId,
			asset.ReportingMultiplicator,
		)
		if err != nil {
			return nil, err
		}
		assets = append(assets, asset)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return assets, nil
}
