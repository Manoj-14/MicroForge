package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	HttpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "auth_http_requests_total",
			Help: "Total HTTP requests received by auth service",
		},
		[]string{"method", "path", "status"},
	)
)

func Init() {
	prometheus.MustRegister(HttpRequestsTotal)
}
