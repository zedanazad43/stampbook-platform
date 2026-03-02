# Vault policy:       
path "secret/data/stampcoin/*" {
  capabilities = ["read", "list"]
}

path "transit/keys/stampcoin-agent" {
  capabilities = ["read", "encrypt", "decrypt"]
}

#     paths 
#   capabilities  "create"  "delete" 