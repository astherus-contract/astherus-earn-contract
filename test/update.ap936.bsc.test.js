const chai = require("chai");
const expect = chai.expect;

describe("UpdateAP936.BSC", () => {
    before(async function () {
        const AstherusAddress = "0x128463A60784c4D3f46c23Af3f65Ed859Ba87974";
        this.Astherus = await ethers.getContractAt('Earn.sol', AstherusAddress);
        const ownerAddress = '0xa8c0c6ee62f5ad95730fe23ccf37d1c1ffaa1c3f';
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [ownerAddress],
        });
        await network.provider.send("hardhat_setBalance", [
            ownerAddress,
            `0x${ethers.parseEther('10').toString(16)}`,
        ]);
        this.owner = await ethers.getSigner(ownerAddress);

        const pauserAddress = '0xF517F1a147fBFD5737872cB48FADf0A60C713777';
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [pauserAddress],
        });
        await network.provider.send("hardhat_setBalance", [
            pauserAddress,
            `0x${ethers.parseEther('10').toString(16)}`,
        ]);
        this.pauser = await ethers.getSigner(pauserAddress);
    });

    beforeEach(async function () {
    });

    it("upgradeToAndCall", async function() {
        const slot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const currentImplementation = ethers.AbiCoder.defaultAbiCoder().decode(['address'], await ethers.provider.getStorage(this.Astherus.target, slot))[0];
        //console.log(currentImplementation);
        const newImplementation = '0xf8eD70C4e199f678308b942eD0DFC7Ee684B858f';
        await this.Astherus.connect(this.owner).upgradeToAndCall(newImplementation, '0x');
        const currentNewImplementation = ethers.AbiCoder.defaultAbiCoder().decode(['address'], await ethers.provider.getStorage(this.Astherus.target, slot))[0];
        //console.log(newImplementation);
        expect(currentNewImplementation).to.be.eq(newImplementation)
    });

    it("grantRole", async function() {
        const PAUSE_ROLE = '0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d';
        const user = '0xF517F1a147fBFD5737872cB48FADf0A60C713777';
        await this.Astherus.connect(this.owner).grantRole(PAUSE_ROLE, user)
        expect(await this.Astherus.hasRole(PAUSE_ROLE, user)).to.be.eq(true)
    })

    it("pause && unpause", async function() {
        let paused = await this.Astherus.paused()
        if (paused) {
            await this.Astherus.connect(this.pauser).unpause()
        }
        paused = await this.Astherus.paused()
        expect(paused).to.be.eq(false)

        await this.Astherus.connect(this.pauser).pause()
        paused = await this.Astherus.paused()
        expect(paused).to.be.eq(true)

        await this.Astherus.connect(this.pauser).unpause()
        paused = await this.Astherus.paused()
        expect(paused).to.be.eq(false)
    })

    it("can update again", async function() {
        const AstherusImplementationFactory = await ethers.getContractFactory('Earn.sol')
        const newContract = await AstherusImplementationFactory.deploy()
        await this.Astherus.connect(this.owner).upgradeToAndCall(newContract.target, '0x');
        const slot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const newImplementation = ethers.AbiCoder.defaultAbiCoder().decode(['address'], await ethers.provider.getStorage(this.Astherus.target, slot))[0];
        //console.log(newImplementation);
        expect(newImplementation).to.be.eq(newContract.target)
    })
})
