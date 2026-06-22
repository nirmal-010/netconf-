document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Toggle Feature Bodies
    const toggles = [
        { id: 'en-vlans', bodyId: 'body-vlans' },
        { id: 'en-stp', bodyId: 'body-stp' },
        { id: 'en-portsec', bodyId: 'body-portsec' },
        { id: 'en-ospf', bodyId: 'body-ospf' },
        { id: 'en-bgp', bodyId: 'body-bgp' },
        { id: 'en-acl', bodyId: 'body-acl' },
        { id: 'en-ipsec', bodyId: 'body-ipsec' },
        { id: 'en-vxlan', bodyId: 'body-vxlan' },
        { id: 'en-vrf', bodyId: 'body-vrf' }
    ];

    toggles.forEach(t => {
        const checkbox = document.getElementById(t.id);
        const body = document.getElementById(t.bodyId);
        if(checkbox && body) {
            checkbox.addEventListener('change', () => {
                body.style.display = checkbox.checked ? 'block' : 'none';
            });
        }
    });

    // Generate CLI Logic
    const generateBtn = document.getElementById('btn-generate');
    const outputCode = document.getElementById('output-code');

    generateBtn.addEventListener('click', () => {
        let cli = '';

        // Basic Config
        const deviceType = document.getElementById('deviceType').value;
        const hostname = document.getElementById('hostname').value || 'Device';
        const secret = document.getElementById('secret').value;
        const ipAddress = document.getElementById('ipAddress').value;
        const subnetMask = document.getElementById('subnetMask').value;
        const gateway = document.getElementById('gateway').value;

        cli += `! Generated via Enterprise NetConfig\n`;
        cli += `enable\n`;
        cli += `configure terminal\n`;
        cli += `hostname ${hostname}\n`;
        if (secret) cli += `enable secret ${secret}\n`;
        cli += `!\n`;

        // Data Center: VRF (Must be created early so interfaces can join)
        if (document.getElementById('en-vrf')?.checked) {
            const vrfName = document.getElementById('vrf-name').value;
            if (vrfName) {
                cli += `! VRF Configuration\n`;
                if (deviceType === 'nexus') {
                    cli += `vrf context ${vrfName}\n`;
                } else {
                    cli += `vrf definition ${vrfName}\n address-family ipv4\n exit-address-family\n`;
                }
                cli += `!\n`;
            }
        }

        // Layer 2: VLANs
        if (document.getElementById('en-vlans')?.checked) {
            const vlans = document.getElementById('vlan-ids').value.split(',').map(v => v.trim()).filter(v => v);
            if (vlans.length > 0) {
                cli += `! VLAN Configuration\n`;
                vlans.forEach(v => {
                    cli += `vlan ${v}\n name VLAN_${v}\n`;
                });
                cli += `!\n`;
            }
        }

        // Layer 2: STP
        if (document.getElementById('en-stp')?.checked) {
            const stpMode = document.getElementById('stp-mode').value;
            cli += `! Spanning Tree Protocol\n`;
            cli += `spanning-tree mode ${stpMode}\n`;
            cli += `!\n`;
        }

        // Management Interface
        if (ipAddress) {
            cli += `! Management Interface\n`;
            const mgmtInt = deviceType === 'router' ? 'GigabitEthernet0/0' : (deviceType === 'nexus' ? 'mgmt0' : 'Vlan1');
            cli += `interface ${mgmtInt}\n`;
            cli += ` ip address ${ipAddress} ${subnetMask || '255.255.255.0'}\n`;
            cli += ` no shutdown\n`;
            cli += `exit\n!\n`;
            if (gateway && deviceType !== 'nexus') {
                if (deviceType === 'router') {
                    cli += `ip route 0.0.0.0 0.0.0.0 ${gateway}\n!\n`;
                } else {
                    cli += `ip default-gateway ${gateway}\n!\n`;
                }
            }
        }

        // Layer 2: Port Security
        if (document.getElementById('en-portsec')?.checked) {
            const maxMac = document.getElementById('portsec-max').value || 2;
            const violation = document.getElementById('portsec-violation').value || 'restrict';
            cli += `! Port Security (Template for interfaces)\n`;
            cli += `! Apply to interfaces using: switchport port-security\n`;
            cli += `switchport port-security maximum ${maxMac}\n`;
            cli += `switchport port-security violation ${violation}\n`;
            cli += `!\n`;
        }

        // Security: DHCP Snooping
        if (document.getElementById('en-dhcp-snoop')?.checked) {
            cli += `! DHCP Snooping\n`;
            cli += `ip dhcp snooping\n`;
            cli += `ip dhcp snooping vlan 1-4094\n`;
            cli += `!\n`;
        }

        // Security: ACL
        if (document.getElementById('en-acl')?.checked) {
            const aclName = document.getElementById('acl-name').value || 'BLOCK_TRAFFIC';
            const aclDeny = document.getElementById('acl-deny').value;
            cli += `! Access Control List\n`;
            cli += `ip access-list standard ${aclName}\n`;
            if (aclDeny) cli += ` deny ${aclDeny}\n`;
            cli += ` permit any\n`;
            cli += `!\n`;
        }

        // VPN: IPsec
        if (document.getElementById('en-ipsec')?.checked) {
            const peer = document.getElementById('ipsec-peer').value;
            const psk = document.getElementById('ipsec-psk').value;
            if (peer && psk) {
                cli += `! Site-to-Site IPsec VPN\n`;
                cli += `crypto isakmp policy 10\n encr aes 256\n hash sha256\n authentication pre-share\n group 14\n exit\n`;
                cli += `crypto isakmp key ${psk} address ${peer}\n`;
                cli += `crypto ipsec transform-set TS esp-aes 256 esp-sha-hmac\n`;
                cli += `!\n`;
            }
        }

        // Data Center: VXLAN
        if (document.getElementById('en-vxlan')?.checked && deviceType === 'nexus') {
            const vni = document.getElementById('vxlan-vni').value;
            const mcast = document.getElementById('vxlan-mcast').value;
            cli += `! VXLAN Configuration\n`;
            cli += `feature nv overlay\nfeature vn-segment-vlan-based\n`;
            if (vni) {
                cli += `vlan ${vni.substring(0, 4) || '10'}\n vn-segment ${vni}\n`;
                cli += `interface nve1\n no shutdown\n source-interface loopback0\n`;
                if (mcast) cli += ` member vni ${vni} mcast-group ${mcast}\n`;
            }
            cli += `!\n`;
        }

        // Layer 3: OSPF
        if (document.getElementById('en-ospf')?.checked) {
            const pid = document.getElementById('ospf-pid').value || 1;
            const net = document.getElementById('ospf-net').value;
            cli += `! OSPF Routing\n`;
            if (deviceType === 'nexus') cli += `feature ospf\n`;
            cli += `router ospf ${pid}\n`;
            if (net) cli += ` network ${net}\n`;
            cli += `!\n`;
        }

        // Layer 3: BGP
        if (document.getElementById('en-bgp')?.checked) {
            const as = document.getElementById('bgp-as').value;
            const neighbor = document.getElementById('bgp-neighbor').value;
            const remoteAs = document.getElementById('bgp-remote-as').value;
            if (as) {
                cli += `! BGP Routing\n`;
                if (deviceType === 'nexus') cli += `feature bgp\n`;
                cli += `router bgp ${as}\n`;
                if (neighbor && remoteAs) {
                    cli += ` neighbor ${neighbor} remote-as ${remoteAs}\n`;
                    cli += `  address-family ipv4 unicast\n`;
                }
                cli += `!\n`;
            }
        }

        cli += `end\nwrite memory\n`;

        outputCode.textContent = cli;

        // Visual flash
        outputCode.style.color = '#34d399';
        setTimeout(() => { outputCode.style.color = '#a5b4fc'; }, 500);
    });

    // Copy Button
    document.getElementById('copy-btn').addEventListener('click', () => {
        const text = outputCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copy-btn');
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        });
    });
});
