./docker-stop.sh
sudo docker container rm network-rt
sudo docker rmi richbu/img-network-rt
sudo docker compose -f docker-compose-full.yaml up -d
./docker-stop.sh
