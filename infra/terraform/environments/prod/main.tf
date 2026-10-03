# Environment: prod
locals {
  environment = "prod"
  project     = "shopops"
  tags = {
    Project     = "ShopOps"
    Environment = "prod"
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-${local.project}-${local.environment}"
  location = var.location
  tags     = local.tags
}

module "network" {
  source              = "../../modules/network"
  environment         = local.environment
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

module "aks" {
  source              = "../../modules/aks"
  environment         = local.environment
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

module "acr" {
  source              = "../../modules/acr"
  environment         = local.environment
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}
