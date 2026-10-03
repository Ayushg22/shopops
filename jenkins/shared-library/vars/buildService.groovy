def call(String serviceName, String tag) {
  echo "Building Docker image for ${serviceName}:${tag}"
  sh "docker build -t ${serviceName}:${tag} -f services/${serviceName}/Dockerfile services/${serviceName}"
}
