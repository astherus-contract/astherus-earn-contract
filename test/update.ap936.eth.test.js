const chai = require("chai");
const expect = chai.expect;

describe("UpdateAP936.ETH", () => {
    before(async function () {
        const AstherusAddress = "0x604DD02d620633Ae427888d41bfd15e38483736E";
        this.Astherus = await ethers.getContractAt('Earn.sol', AstherusAddress);
        const ownerAddress = '0x1FE3Fe2Ddd19AB58B0c56054a5AF217Afb27eCEA';
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

    it("grantRole", async function() {
        const UPGRADE_ROLE = '0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3';
        const user = '0x1fe3fe2ddd19ab58b0c56054a5af217afb27ecea';
        await this.Astherus.connect(this.owner).grantRole(UPGRADE_ROLE, user);
        expect(await this.Astherus.hasRole(UPGRADE_ROLE, user)).to.be.eq(true);
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
        const AstherusImplementationFactory = await ethers.getContractFactory('Earn.sol.sol')
        const newContract = await AstherusImplementationFactory.deploy()
        await this.Astherus.connect(this.owner).upgradeToAndCall(newContract.target, '0x');
        const slot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const newImplementation = ethers.AbiCoder.defaultAbiCoder().decode(['address'], await ethers.provider.getStorage(this.Astherus.target, slot))[0];
        //console.log(newImplementation);
        expect(newImplementation).to.be.eq(newContract.target)
    })
})
