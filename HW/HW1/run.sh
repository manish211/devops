echo "==================================================================================="
ssh-agent

eval `ssh-agent`

#ssh-add /vagrant/privateKeys/*pem

ssh-add ~/.ssh/id_rsa
echo "==================================================================================="

node /home/vagrant/awsEc2_main.js

#Run the digital ocean file

echo "============= RUNNING DIGITAL OCEAN NOW =================="

node /home/vagrant/digitalOcean_main.js

echo "Starting Ansible now...Hold On!!"
echo "\n AWS is node0 and DIGITAL OCEAN is node1\n"

ansible-playbook /vagrant/playbooks/newplaybook.yml -i /vagrant/inventory/inventory 

echo " ======== END OF PROGRAM . THANK YOU ========="
