import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
describe("TipJar", function () {
  let tipJar: any;
  let owner: any;
  let alice: any;
  let bob: any;
  let grace: any;

  beforeEach(async function () {
    [owner, alice, bob, grace] = await ethers.getSigners();
    const TipJar = await ethers.getContractFactory("TipJar");
    tipJar = await TipJar.deploy(owner.address);
  });

  it("should allow Alice to donate with message", async function () {
    // ARRANGE
    const donationAmount = ethers.utils.parseEther("0.003");
    const message = "My own small donation";
    
    // ACT
    const tx = await tipJar.connect(alice).donate(message, { value: donationAmount });
    
    // ASSERT
    expect(await tipJar.totalDonated(alice.address)).to.equal(donationAmount);
    expect(await tipJar.getBalance()).to.equal(donationAmount);
    expect(tx).to.emit(tipJar, "NewTip").withArgs(alice.address, donationAmount, message);
     
  });

  it("should allow alice donate without a message", async function () {
    
    const donationAmount = ethers.utils.parseEther("0.005");
    const message = "";

    const tx = await tipJar.connect(alice).donate(message, {value: donationAmount})

    expect(await tipJar.totalDonated(alice.address)).to.equal(donationAmount);
    expect(await tipJar.getBalance()).to.equal(donationAmount);
    expect(tx).to.emit(tipJar, "NewTip").withArgs(alice.address, donationAmount, message);
  });


  it("should accumulate donations from same person", async function () {
    const firstDonation = ethers.utils.parseEther("0.002");
    const secondDonation = ethers.utils.parseEther("0.004");
    const totalExpected = firstDonation.add(secondDonation);
    const message = "Multiple donations";

    const tx1 = await tipJar.connect(alice).donate(message, { value: firstDonation });
    const tx2 = await tipJar.connect(alice).donate(message, { value: secondDonation });

    expect(await tipJar.totalDonated(alice.address)).to.equal(totalExpected);
    expect(await tipJar.getBalance()).to.equal(totalExpected);
    expect(tx1).to.emit(tipJar, "NewTip").withArgs(alice.address, firstDonation, message);
    expect(tx2).to.emit(tipJar, "NewTip").withArgs(alice.address, secondDonation, message);
  });
  
  it("should track donations from multiple people", async function () {
    const aliceDonation = ethers.utils.parseEther("0.004");
    const bobDonation = ethers.utils.parseEther("0.005");
    const graceDonation = ethers.utils.parseEther("0.003");
    const totalExpected = aliceDonation.add(bobDonation).add(graceDonation);
    const message = "Multiple donors";

    const tx1 = await tipJar.connect(alice).donate(message, { value: aliceDonation });
    const tx2 = await tipJar.connect(bob).donate(message, { value: bobDonation });
    const tx3 = await tipJar.connect(grace).donate(message, { value: graceDonation });

    expect(await tipJar.totalDonated(alice.address)).to.equal(aliceDonation);
    expect(await tipJar.totalDonated(bob.address)).to.equal(bobDonation);
    expect(await tipJar.totalDonated(grace.address)).to.equal(graceDonation);
    expect(await tipJar.getBalance()).to.equal(totalExpected);
    expect(tx1).to.emit(tipJar, "NewTip").withArgs(alice.address, aliceDonation, message);
    expect(tx2).to.emit(tipJar, "NewTip").withArgs(bob.address, bobDonation, message);
    expect(tx3).to.emit(tipJar, "NewTip").withArgs(grace.address, graceDonation, message);
  });

  it("should reject donations below minimum amount", async function () {
    const donationAmount = ethers.utils.parseEther("0.0005"); // Below 0.001 minimum
    const message = "Too small donation";
  
    await expect(
      tipJar.connect(alice).donate(message, { value: donationAmount })
    ).to.be.revertedWith("DonationTooSmall");
  });

  it("should accept minimum donation amount", async function () {

    const donationAmount = ethers.utils.parseEther("0.001"); // Exactly 0.001
    const message = "Minimum donation"

    const tx = await tipJar.connect(alice).donate(message, { value: donationAmount });

    expect(await tipJar.totalDonated(alice.address)).to.equal(donationAmount);
    expect(await tipJar.getBalance()).to.equal(donationAmount);
    expect(tx).to.emit(tipJar, "NewTip").withArgs(alice.address, donationAmount, message);
  });

  it("should allow owner to withdraw partial amount", async function () {

    const donationAmount = ethers.utils.parseEther("0.01");
    const withdrawAmount = ethers.utils.parseEther("0.005");
    const expectedRemainingBalance = donationAmount.sub(withdrawAmount);

    await tipJar.connect(alice).donate("Partial withdrawal test", { value: donationAmount });

    const WithdrawTx = await tipJar.connect(owner).withdraw(withdrawAmount);

    expect(await tipJar.getBalance()).to.equal(expectedRemainingBalance);
    expect(WithdrawTx).to.emit(tipJar, "Withdrawal").withArgs(owner.address, withdrawAmount);

  });

  it("should allow owner withdraw all funds", async function () {

    const donationAmount = ethers.utils.parseEther("0.02");

    await tipJar.connect(alice).donate("Full withdrawal test", { value: donationAmount });
    const WithdrawTx = await tipJar.connect(owner).withdrawAll();

    expect(await tipJar.getBalance()).to.equal(0);
    expect(WithdrawTx).to.emit(tipJar, "Withdrawal").withArgs(owner.address, donationAmount );
  });

  it("should prevent non-owner from withdrawing funds", async function(){

    const donationAmount = ethers.utils.parseEther("0.05")
    const withdrawAmount = ethers.utils.parseEther("0.02");

    await tipJar.connect(alice).donate("c", { value: donationAmount });

    await expect (tipJar.connect(bob).withdraw(withdrawAmount)).to.be.revertedWith("OwnableUnauthorizedAccount");
  });

  it("should prevent owner from withdrawing more than available balance", async function() {

    const donationAmount = ethers.utils.parseEther("0.005")
    const withdrawAmount = ethers.utils.parseEther("0.01"); // More than available balance

    await tipJar.connect(alice).donate(" ", { value: donationAmount });

    await expect(
      tipJar.connect(owner).withdraw(withdrawAmount)
    ).to.be.revertedWith("InsufficientBalance")
  });

  it("should prevent owner from withdrawing zero amount", async function(){
    const donationAmount = ethers.utils.parseEther("0.04");
    const withdrawAmount = ethers.utils.parseEther("0");

    await tipJar.connect(alice).donate(" ", { value: donationAmount });
    await expect(
      tipJar.connect(owner).withdraw(withdrawAmount)
    ).to.be.revertedWith("ZeroAmount");
  });

  it("should return correct contract balance", async function (){
    const donationAmount = ethers.utils.parseEther("0.007");
    
    await tipJar.connect(alice).donate("Balance check", { value: donationAmount });
    expect(await tipJar.getBalance()).to.equal(donationAmount);


  });

  it("should return correct total donated by an address", async function(){
    const donationAmount = ethers.utils.parseEther("0.003");

    await tipJar.connect(alice).donate("Total donated check", { value: donationAmount });
    expect(await tipJar.totalDonated(alice.address)).to.equal(donationAmount);
  });




 });
