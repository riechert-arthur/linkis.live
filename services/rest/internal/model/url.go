package model

type AddUrlRequest struct {
	Short string `json:"short"`
	Long  string `json:"long" validate:"required,url"`
}

type GetUrlRequest struct {
	Short string `json:"short" validate:"required,url"`
}
