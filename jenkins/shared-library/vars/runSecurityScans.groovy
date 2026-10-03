def call(String imageName) {
  echo "Scanning ${imageName} with Trivy..."
  sh "trivy image --severity HIGH,CRITICAL ${imageName} || true"
}
