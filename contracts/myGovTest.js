const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { int } = require("hardhat/internal/core/params/argumentTypes");

describe("MyGov", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const USDToken = await ethers.getContractFactory("USDToken");
    const usdtoken = await USDToken.deploy(100000000);
    const address = usdtoken.target;
    const MyGov = await ethers.getContractFactory("MyGov");
    const mygov = await MyGov.deploy(2000000000, address);
    const thisadress = mygov.target;
    const signerlist = await ethers.getSigners();
    const owner = signerlist[0];
    const testAccount2 = signerlist[1];
    const testAccount3 = signerlist[2];
    const testAccount4 = signerlist[3];

    return {
      mygov,
      thisadress,
      owner,
      testAccount2,
      testAccount3,
      testAccount4,
      usdtoken,
      signerlist,
    };
  }

  it("should deploy and set the owner correctly", async function () {
    const { mygov, thisadress } = await loadFixture(
      deployContractAndSetVariables
    );

    expect(await mygov.owner()).to.equal(thisadress);
  });

  it("should execute the faucet function correctly", async function () {
    const { mygov, thisadress, testAccount2, signerlist } = await loadFixture(
      deployContractAndSetVariables
    );
    await mygov.connect(testAccount2).faucet();
    const balance = await mygov.balanceOf(testAccount2.address);
    let expectedbalance = BigInt(1) * BigInt(10 ** 18);
    expect(balance).to.equal(expectedbalance);
  });

  it("should execute the donateMyGovToken and approveContract correctly", async function () {
    const { mygov, thisadress, testAccount3 } = await loadFixture(
      deployContractAndSetVariables
    );

    await mygov.connect(testAccount3).faucet();
    await mygov.connect(testAccount3).approveContract();
    let faucetmoney = BigInt(1) * BigInt(10 ** 18);

    await mygov.connect(testAccount3).donateMyGovToken(faucetmoney);
    const balance = await mygov.balanceOf(testAccount3.address);
    expect(balance).to.equal(0);
  });

  it("should execute the transfer correctly", async function () {
    const { mygov, testAccount4 } = await loadFixture(
      deployContractAndSetVariables
    );
    let transfermoney = BigInt(8) * BigInt(10 ** 18);
    await mygov.transfer(testAccount4.address, transfermoney);
    const balance = await mygov.balanceOf(testAccount4.address);
    const ismembervalue = await mygov.isMember(testAccount4.address);
    expect(balance).to.equal(transfermoney);
    expect(ismembervalue).to.equal(true);
  });

  it("should execute the donateUSDT correctly", async function () {
    const { mygov, usdtoken, testAccount3, thisadress } = await loadFixture(
      deployContractAndSetVariables
    );
    let transfermoney = BigInt(8) * BigInt(10 ** 18);
    await usdtoken.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    let donatemoney = BigInt(3) * BigInt(10 ** 18);
    const balancebefore = await usdtoken.balanceOf(testAccount3.address);
    await mygov.connect(testAccount3).donateUSD(donatemoney);
    const balanceafter = await usdtoken.balanceOf(testAccount3.address);
    expect(balanceafter).to.equal(balancebefore - donatemoney);
  });

  it("should execute the submitSurvey and getSurveyInfo correctly", async function () {
    const { mygov, usdtoken, testAccount3, thisadress } = await loadFixture(
      deployContractAndSetVariables
    );
    let transfermoney = BigInt(8) * BigInt(10 ** 18);
    await mygov.connect(testAccount3).approveContract();
    await usdtoken.transfer(testAccount3.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    let deadline = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitSurvey("testsurvey", deadline, 10, 2);
    const [ipfsHash, surveyDeadline, numChoices, atMostChoice] =
      await mygov.getSurveyInfo(0);
    expect(ipfsHash).to.equal("testsurvey");
    expect(surveyDeadline).to.equal(deadline);
    expect(numChoices).to.equal(10);
    expect(atMostChoice).to.equal(2);
  });
  it("should execute the getNoOfSurveys and getSurveyOwner correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(8) * BigInt(10 ** 18);
    await mygov.connect(testAccount3).approveContract();
    await mygov.connect(testAccount2).approveContract();
    await usdtoken.transfer(testAccount3.address, transfermoney);
    await usdtoken.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approveContract();
    await usdtoken.transfer(signerlist[3].address, transfermoney);
    await mygov.transfer(signerlist[3].address, transfermoney);
    await usdtoken.connect(signerlist[3]).approve(thisadress, transfermoney);
    await mygov.connect(signerlist[3]).approveContract();
    await usdtoken.connect(testAccount2).approve(thisadress, transfermoney);
    let deadline = BigInt(8) * BigInt(10 ** 18);
    await mygov
      .connect(testAccount3)
      .submitSurvey("testsurvey", deadline, 10, 2);
    await mygov
      .connect(testAccount2)
      .submitSurvey("testsurvey2", deadline, 10, 2);
    const numberofsurvey = await mygov.getNoOfSurveys();
    const ownerof1 = await mygov.getSurveyOwner(0);
    const ownerof2 = await mygov.getSurveyOwner(1);
    await mygov.connect(signerlist[3]).takeSurvey(1, [0, 1]);
    const surveyresult = await mygov.getSurveyResults(1);
    expect(ownerof1).to.equal(testAccount3.address);
    expect(ownerof2).to.equal(testAccount2.address);
    expect(numberofsurvey).to.equal(2);
    expect(surveyresult[1][0]).to.equal(BigInt(0));
    expect(surveyresult[1][1]).to.equal(BigInt(1));
  });
  it("should execute the TakeSurvey and getSurveyResults correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(8) * BigInt(10 ** 18);
    await mygov.connect(testAccount3).approveContract();
    await mygov.connect(testAccount2).approveContract();
    await usdtoken.transfer(testAccount3.address, transfermoney);
    await usdtoken.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approveContract();
    await usdtoken.transfer(signerlist[3].address, transfermoney);
    await mygov.transfer(signerlist[3].address, transfermoney);
    await usdtoken.connect(signerlist[3]).approve(thisadress, transfermoney);
    await mygov.connect(signerlist[3]).approveContract();
    await usdtoken.connect(testAccount2).approve(thisadress, transfermoney);
    let deadline = BigInt(8) * BigInt(10 ** 18);
    await mygov
      .connect(testAccount3)
      .submitSurvey("testsurvey", deadline, 10, 2);
    await mygov
      .connect(testAccount2)
      .submitSurvey("testsurvey2", deadline, 10, 2);
    await mygov.connect(signerlist[3]).takeSurvey(1, [0, 1]);
    const surveyresult = await mygov.getSurveyResults(1);
    expect(surveyresult[1][0]).to.equal(BigInt(0));
    expect(surveyresult[1][1]).to.equal(BigInt(1));
  });
  it("should execute the submitProjectProposal and getProjectInfo correctly", async function () {
    const { mygov, usdtoken, testAccount3, thisadress } = await loadFixture(
      deployContractAndSetVariables
    );
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    await usdtoken.transfer(testAccount3.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approve(thisadress, transfermoney);
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );
    const [ipfsHash, proposaldeadline, paymentamounts, paymentdeadlines] =
      await mygov.getProjectInfo(0);
    expect(ipfsHash).to.equal("testproject");
    expect(proposaldeadline).to.equal(deadline);
    expect(paymentdeadlines[0]).to.equal(deadline);
    expect(paymentdeadlines[1]).to.equal(deadline);
    expect(paymentamounts[0]).to.equal(payment);
    expect(paymentamounts[1]).to.equal(payment);
  });
  it("should execute the getNoOfProjectProposals and getProjectOwner correctly", async function () {
    const { mygov, usdtoken, testAccount3, thisadress, testAccount4 } =
      await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    await usdtoken.transfer(testAccount3.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approve(thisadress, transfermoney);
    await usdtoken.transfer(testAccount4.address, transfermoney);
    await mygov.transfer(testAccount4.address, transfermoney);
    await usdtoken.connect(testAccount4).approve(thisadress, transfermoney);
    await mygov.connect(testAccount4).approve(thisadress, transfermoney);
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );
    await mygov
      .connect(testAccount4)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );

    const projectowner0 = await mygov.getProjectOwner(0);
    const projectowner1 = await mygov.getProjectOwner(1);
    const noofprojects = await mygov.getNoOfProjectProposals();
    expect(projectowner0).to.equal(testAccount3.address);
    expect(projectowner1).to.equal(testAccount4.address);
    expect(noofprojects).to.equal(2);
  });

  it("should execute the 100 wallets vote to survey", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(30) * BigInt(10 ** 18);

    await usdtoken.transfer(testAccount3.address, transfermoney);
    await usdtoken.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approveContract();
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let votearray = [];
    await mygov
      .connect(testAccount3)
      .submitSurvey("testsurvey", deadline, 10, 2);
    for (let i = 5; i < 105; i++) {
      await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 10);
      votearray.push(randomInteger.toString());
      await mygov.connect(signerlist[i]).takeSurvey(0, [randomInteger]);
    }

    const surveyresult = await mygov.getSurveyResults(0);
    const actualArrayAsStrings = surveyresult[1].map((value) =>
      value.toString()
    );
    console.log(actualArrayAsStrings);
    for (let i = 0; i < 100; i++) {
      expect(actualArrayAsStrings[i]).to.equal(votearray[i]);
    }
  });
  it("should execute the 200 wallets vote to survey", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(30) * BigInt(10 ** 18);

    await usdtoken.transfer(testAccount3.address, transfermoney);
    await usdtoken.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approveContract();
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let votearray = [];
    await mygov
      .connect(testAccount3)
      .submitSurvey("testsurvey", deadline, 10, 2);
    for (let i = 5; i < 205; i++) {
      await usdtoken.connect(signerlist[i]).approve(thisadress, transfermoney);
      await mygov.connect(signerlist[i]).approveContract();
      await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 10);
      votearray.push(randomInteger.toString());
      await mygov.connect(signerlist[i]).takeSurvey(0, [randomInteger]);
    }

    const surveyresult = await mygov.getSurveyResults(0);
    const actualArrayAsStrings = surveyresult[1].map((value) =>
      value.toString()
    );
    console.log(actualArrayAsStrings);
    for (let i = 0; i < 200; i++) {
      expect(actualArrayAsStrings[i]).to.equal(votearray[i]);
    }
  });
  it("should execute the 300 wallets vote to survey", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(30) * BigInt(10 ** 18);

    await usdtoken.transfer(testAccount3.address, transfermoney);
    await usdtoken.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approveContract();
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let votearray = [];
    await mygov
      .connect(testAccount3)
      .submitSurvey("testsurvey", deadline, 10, 2);
    for (let i = 5; i < 305; i++) {
      await usdtoken.connect(signerlist[i]).approve(thisadress, transfermoney);
      await mygov.connect(signerlist[i]).approveContract();
      await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 10);
      votearray.push(randomInteger.toString());
      await mygov.connect(signerlist[i]).takeSurvey(0, [randomInteger]);
    }

    const surveyresult = await mygov.getSurveyResults(0);
    const actualArrayAsStrings = surveyresult[1].map((value) =>
      value.toString()
    );
    console.log(actualArrayAsStrings);
    for (let i = 0; i < 200; i++) {
      expect(actualArrayAsStrings[i]).to.equal(votearray[i]);
    }
  });
  it("should execute the 500 wallets vote to survey", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(30) * BigInt(10 ** 18);

    await usdtoken.transfer(testAccount3.address, transfermoney);
    await usdtoken.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount2.address, transfermoney);
    await mygov.transfer(testAccount3.address, transfermoney);
    await usdtoken.connect(testAccount3).approve(thisadress, transfermoney);
    await mygov.connect(testAccount3).approveContract();
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let votearray = [];
    await mygov
      .connect(testAccount3)
      .submitSurvey("testsurvey", deadline, 10, 2);
    for (let i = 5; i < 505; i++) {
      await usdtoken.connect(signerlist[i]).approve(thisadress, transfermoney);
      await mygov.connect(signerlist[i]).approveContract();
      await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 10);
      votearray.push(randomInteger.toString());
      await mygov.connect(signerlist[i]).takeSurvey(0, [randomInteger]);
    }

    const surveyresult = await mygov.getSurveyResults(0);
    const actualArrayAsStrings = surveyresult[1].map((value) =>
      value.toString()
    );
    console.log(actualArrayAsStrings);
    for (let i = 0; i < 500; i++) {
      expect(actualArrayAsStrings[i]).to.equal(votearray[i]);
    }
  });
  it("should execute  voteForProjectProposal correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );
    const myproposal = await mygov.proposals(0);
    await mygov.connect(testAccount4).voteForProjectProposal(0, true);
    const myproposallast = await mygov.proposals(0);
    const myproposaltruecount = await myproposallast.noOfTrue;
    expect(myproposaltruecount).to.equal(BigInt(1));
  });
  it("should execute  delegate correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );
    await mygov.connect(testAccount4).voteForProjectProposal(0, true);
    await mygov.connect(testAccount2).delegateVoteTo(testAccount4, 0);
    const myproposal = await mygov.proposals(0);
    await mygov.connect(testAccount4).voteForProjectProposal(0, true);
    const myproposallast = await mygov.proposals(0);
    const myproposaltruecount = await myproposallast.noOfTrue;
    expect(myproposaltruecount).to.equal(BigInt(2));
  });
  it("should execute voteForProjectPayment correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );
    const myproposal = await mygov.proposals(0);
    await mygov.connect(testAccount4).voteForProjectPayment(0, true);
    const myproposallast = await mygov.proposals(0);
    const myproposaltruecount = await myproposallast.noOfTruePayment;
    expect(myproposaltruecount).to.equal(BigInt(1));
  });
  it("should execute getIsProjectFunded correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );
    const myproposal = await mygov.proposals(0);
    await mygov.connect(testAccount4).voteForProjectPayment(0, true);
    await mygov.connect(testAccount4).voteForProjectProposal(0, true);
    await mygov.connect(testAccount2).voteForProjectPayment(0, true);
    await mygov.connect(testAccount2).voteForProjectProposal(0, true);
    const ismyproposalfunded = await mygov.getIsProjectFunded(0);
    expect(ismyproposalfunded).to.equal(true);
  });
  it("should execute reserveProjectGrant correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [deadline, deadline]
      );
    const myproposal = await mygov.proposals(0);
    await mygov.connect(testAccount4).voteForProjectPayment(0, true);
    await mygov.connect(testAccount4).voteForProjectProposal(0, true);
    await mygov.connect(testAccount2).voteForProjectPayment(0, true);
    await mygov.connect(testAccount2).voteForProjectProposal(0, true);
    await mygov.connect(testAccount3).reserveProjectGrant(0);
    const ismyproposalfunded = await mygov.getIsProjectFunded(0);
    const myproposalupdated = await mygov.proposals(0);
    const myfundedamount = await myproposalupdated.fundReserved;
    expect(myfundedamount).to.equal(payment * BigInt(2));
  });
  it("should execute getUSDReceivedByProject  withdrawProjectPayment correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [20000, 20000]
      );
    const myproposal = await mygov.proposals(0);
    await mygov.connect(testAccount4).voteForProjectPayment(0, true);
    await mygov.connect(testAccount4).voteForProjectProposal(0, true);
    await mygov.connect(testAccount2).voteForProjectPayment(0, true);
    await mygov.connect(testAccount2).voteForProjectProposal(0, true);
    await mygov.connect(testAccount3).reserveProjectGrant(0);
    await mygov.connect(testAccount3).withdrawProjectPayment(0);
    await mygov.connect(testAccount3).getUSDReceivedByProject(0);
    const myproposalupdated = await mygov.proposals(0);
    const myfundedamount = await myproposalupdated.fundReserved;
    const myfundedamountwithdrawn = await myproposalupdated.withdrawedAmount;
    expect(myfundedamount).to.equal(payment * BigInt(1));
    expect(myfundedamountwithdrawn).to.equal(payment * BigInt(1));
  });
  it("should execute proposal with 100 correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [20000, 20000]
      );
    const myproposal = await mygov.proposals(0);
    for (let i = 5; i < 105; i++) {
      await mygov.connect(signerlist[i]).approveContract();
      await usdtoken.connect(signerlist[i]).approve(thisadress, transfermoney);
      await await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 1);
      let mybool = Math.random() < 0.5;

      await mygov.connect(signerlist[i]).voteForProjectPayment(0, mybool);
      await mygov.connect(signerlist[i]).voteForProjectProposal(0, mybool);
    }
    await mygov.connect(testAccount3).reserveProjectGrant(0);
    await mygov.connect(testAccount3).withdrawProjectPayment(0);
    await mygov.connect(testAccount3).getUSDReceivedByProject(0);
    const myproposalupdated = await mygov.proposals(0);
    const myfundedamount = await myproposalupdated.fundReserved;
    const myfundedamountwithdrawn = await myproposalupdated.withdrawedAmount;
    expect(myfundedamount).to.equal(payment * BigInt(1));
    console.log(myproposalupdated);
    expect(myfundedamountwithdrawn).to.equal(payment * BigInt(1));
  });
  it("should execute proposal with 200 correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [20000, 20000]
      );
    const myproposal = await mygov.proposals(0);
    for (let i = 5; i < 205; i++) {
      await mygov.connect(signerlist[i]).approveContract();
      await usdtoken.connect(signerlist[i]).approve(thisadress, transfermoney);
      await await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 1);
      let mybool = Math.random() < 0.5;

      await mygov.connect(signerlist[i]).voteForProjectPayment(0, mybool);
      await mygov.connect(signerlist[i]).voteForProjectProposal(0, mybool);
    }
    await mygov.connect(testAccount3).reserveProjectGrant(0);
    await mygov.connect(testAccount3).withdrawProjectPayment(0);
    await mygov.connect(testAccount3).getUSDReceivedByProject(0);
    const myproposalupdated = await mygov.proposals(0);
    const myfundedamount = await myproposalupdated.fundReserved;
    const myfundedamountwithdrawn = await myproposalupdated.withdrawedAmount;
    expect(myfundedamount).to.equal(payment * BigInt(1));
    console.log(myproposalupdated);
    expect(myfundedamountwithdrawn).to.equal(payment * BigInt(1));
  });
  it("should execute proposal with 300 correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [20000, 20000]
      );
    const myproposal = await mygov.proposals(0);
    for (let i = 5; i < 305; i++) {
      await mygov.connect(signerlist[i]).approveContract();
      await usdtoken.connect(signerlist[i]).approve(thisadress, transfermoney);
      await await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 1);
      let mybool = Math.random() < 0.5;

      await mygov.connect(signerlist[i]).voteForProjectPayment(0, mybool);
      await mygov.connect(signerlist[i]).voteForProjectProposal(0, mybool);
    }
    await mygov.connect(testAccount3).reserveProjectGrant(0);
    await mygov.connect(testAccount3).withdrawProjectPayment(0);
    await mygov.connect(testAccount3).getUSDReceivedByProject(0);
    const myproposalupdated = await mygov.proposals(0);
    const myfundedamount = await myproposalupdated.fundReserved;
    const myfundedamountwithdrawn = await myproposalupdated.withdrawedAmount;
    expect(myfundedamount).to.equal(payment * BigInt(1));
    console.log(myproposalupdated);
    expect(myfundedamountwithdrawn).to.equal(payment * BigInt(1));
  });
  it("should execute proposal with 500 correctly", async function () {
    const {
      mygov,
      usdtoken,
      testAccount3,
      thisadress,
      testAccount4,
      testAccount2,
      signerlist,
    } = await loadFixture(deployContractAndSetVariables);
    let transfermoney = BigInt(100) * BigInt(10 ** 18);
    myusers = [testAccount3, testAccount4, testAccount2];
    for (let i = 0; i < 3; i++) {
      await usdtoken.transfer(myusers[i].address, transfermoney);
      await mygov.transfer(myusers[i].address, transfermoney);
      await usdtoken.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approve(thisadress, transfermoney);
      await mygov.connect(myusers[i]).approveContract();
    }
    let deadline = BigInt(8) * BigInt(10 ** 18);
    let payment = BigInt(8) * BigInt(10 ** 18);

    await mygov
      .connect(testAccount3)
      .submitProjectProposal(
        "testproject",
        deadline,
        [payment, payment],
        [20000, 20000]
      );
    const myproposal = await mygov.proposals(0);
    for (let i = 5; i < 505; i++) {
      await mygov.connect(signerlist[i]).approveContract();
      await usdtoken.connect(signerlist[i]).approve(thisadress, transfermoney);
      await await usdtoken.transfer(signerlist[i].address, transfermoney);
      await mygov.transfer(signerlist[i].address, transfermoney);
      const randomDecimal = Math.random();
      const randomInteger = Math.floor(randomDecimal * 1);
      let mybool = Math.random() < 0.5;

      await mygov.connect(signerlist[i]).voteForProjectPayment(0, mybool);
      await mygov.connect(signerlist[i]).voteForProjectProposal(0, mybool);
    }
    await mygov.connect(testAccount3).reserveProjectGrant(0);
    await mygov.connect(testAccount3).withdrawProjectPayment(0);
    await mygov.connect(testAccount3).getUSDReceivedByProject(0);
    const myproposalupdated = await mygov.proposals(0);
    const myfundedamount = await myproposalupdated.fundReserved;
    const myfundedamountwithdrawn = await myproposalupdated.withdrawedAmount;
    expect(myfundedamount).to.equal(payment * BigInt(1));
    console.log(myproposalupdated);
    expect(myfundedamountwithdrawn).to.equal(payment * BigInt(1));
  });
});
