{{/*
Expand the name of the chart.
*/}}
{{- define "microforge.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "microforge.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "microforge.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "microforge.labels" -}}
helm.sh/chart: {{ include "microforge.chart" . }}
{{ include "microforge.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "microforge.selectorLabels" -}}
app.kubernetes.io/name: {{ include "microforge.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the namespace to use
*/}}
{{- define "microforge.namespace" -}}
{{- default .Values.global.namespace .Values.namespace.name }}
{{- end }}

{{/*
Frontend Service labels
*/}}
{{- define "microforge.frontendService.labels" -}}
app: {{ .Values.frontendService.name }}
{{ include "microforge.labels" . }}
{{- end }}

{{/*
Auth Service labels
*/}}
{{- define "microforge.authService.labels" -}}
app: {{ .Values.authService.name }}
{{ include "microforge.labels" . }}
{{- end }}

{{/*
Login Service labels
*/}}
{{- define "microforge.loginService.labels" -}}
app: {{ .Values.loginService.name }}
{{ include "microforge.labels" . }}
{{- end }}

{{/*
Metadata Service labels
*/}}
{{- define "microforge.metadataService.labels" -}}
app: {{ .Values.metadataService.name }}
{{ include "microforge.labels" . }}
{{- end }}

{{/*
Notification Service labels
*/}}
{{- define "microforge.notificationService.labels" -}}
app: {{ .Values.notificationService.name }}
{{ include "microforge.labels" . }}
{{- end }}

{{/*
Login MySQL labels
*/}}
{{- define "microforge.loginMysql.labels" -}}
app: {{ .Values.loginMysql.name }}
{{ include "microforge.labels" . }}
{{- end }}

{{/*
Notification MySQL labels
*/}}
{{- define "microforge.notificationMysql.labels" -}}
app: {{ .Values.notificationMysql.name }}
{{ include "microforge.labels" . }}
{{- end }}

