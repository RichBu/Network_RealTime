docker container stop network-rt
docker container rm network-rt
docker rmi richbu/img-network-rt:latest
docker buildx build --platform=linux/amd64 -t richbu/img-network-rt:latest -f Dockerfile-network-rt .
docker push richbu/img-network-rt:latest
