terraform {
  required_version = ">= 1.7.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
  }
  # Remote state backend configuration (Azure Storage Blob)
  # backend "azurerm" {
  #   resource_group_name  = "rg-shopops-tfstate"
  #   storage_account_name = "stshopopstfstate"
  #   container_name       = "tfstate"
  #   key                  = "shopops.prod.tfstate"
  # }
}

provider "azurerm" {
  features {}
}
