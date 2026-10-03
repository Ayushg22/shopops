# Variables for acr module
variable "environment" {
  type        = string
  description = "Deployment environment (e.g. dev, prod)"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "eastus"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group"
}
