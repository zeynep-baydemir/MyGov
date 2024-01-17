pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MyGov is ERC20 {
    address public USDToken; // address of the USD Token contract
    address public MyGov = address(this); // address of this contract
    address public owner; // owner of the contract
    uint public index = 0; //
    uint public proposalIndex = 0; // index to keep number of proposals
    uint public surveyAmount = 0; // index to keep number of surveys
    mapping(address => bool) public isMember; // mapping to check whether address is member
    uint public memberAmount = 1; // keeps number of members
    mapping(address => bool) faucetTaken; // checking whether address takes the token from faucet


    // constructor takes token supply and address of the USD Token
    constructor(uint _tokenSupply, address _usdToken) ERC20("MyGov", "MyGov") {
        owner = address(this);
        isMember[msg.sender] = true;
        USDToken = _usdToken;
        _mint(owner, 10000000 * (10 ** 18)); // minting initial supply to owner
        _mint(msg.sender, 10000000 * (10 ** 18));
    }

    struct Survey {
        string ipfsHash;
        uint surveyDeadline;
        uint numChoices;
        uint atMostChoice;
        address owner; // owner address of the survey
        uint surveyId;
        uint[] surveyChoices;
        mapping(address => uint[]) choices; // mapping to store choices made by each participant
        uint numofTaken; // keeps number of takes of the survey
    }

    struct Proposal {
        string ipfsHash;
        uint voteDeadLine;
        uint[] paymentAmounts;
        uint[] paySchedule;
        bool funded; // checks if the project is funded
        uint fundReserved; // keeps the reserved funding
        uint noOfVotes; // keeps the number of votes
        mapping(address => bool) votes; // mapping to store votes made by each member
        address owner; // owner address of the proposal
        mapping(address => uint) voteAmountProposal; // keeps number of votes of members for proposal
        mapping(address => uint) voteAmountPayment; // keeps number of votes of members for payments
        uint noOfTrue; // keeps number of true vote for proposal
        uint noOfTruePayment; // keeps number of true vote for payment
        uint paymentIndex; // keeps proposals next payment
        uint withdrawedAmount; // keeps withdrawed amount
        mapping(address => bool) votedYet; // to check whether user use vote yet
        mapping(address => bool) votedPaymentYet; // to check whether user use payment vote yet
    }

    mapping(uint => Survey) surveys; // all surveys in contract
    mapping(uint => Proposal) public proposals; // all proposals in contract

    modifier onlyMyGovMember() {
        // checks whether the msg sender is government member
        require(balanceOf(msg.sender) >= 1 * (10 ** 18), "Not a MyGov member");
        _;
    }

    function approveContract() external {
        // approves the contract
        approve(address(this), type(uint256).max);
    }

    function donateUSD(uint amount) public {
        // donates USD to contracts from msg sender
        IERC20(USDToken).transferFrom(msg.sender, address(this), amount);
    }

    function donateMyGovToken(uint amount) public {
        // donates MyGov token to contracts from msg sender
        IERC20(MyGov).transferFrom(msg.sender, address(this), amount);
    }

    function faucet() public {
        // gives msg sender 1 MyGov token from contract only once
        require(!faucetTaken[msg.sender]); // checks whether faucet is taken or not
        IERC20(MyGov).transfer(msg.sender, 1 * (1e18)); // transfers 1 MyGov Token
        faucetTaken[msg.sender] = true; // changes faucetTaken true for msg sender
    }

    // checks deadline, number of choices and atmostchoice and
    // takes 2 MyGov token and 5 USD token from survey owner and
    // adds survey to the surveys
    function submitSurvey(
        string memory _ipfsHash,
        uint _surveyDeadline,
        uint _numChoices,
        uint _atMostChoice
    ) public onlyMyGovMember returns (uint surveyId) {
        require(_surveyDeadline > block.timestamp, "Invalid survey deadline");
        require(_numChoices > 0, "Invalid number of choices");
        require(_atMostChoice <= _numChoices, "Invalid value for atMostChoice");
        require(
            IERC20(MyGov).transferFrom(msg.sender, address(this), 2 * (1e18))
        );
        require(
            IERC20(USDToken).transferFrom(msg.sender, address(this), 5 * (1e18))
        );

        surveyId = index;
        Survey storage newSurvey = surveys[surveyId];
        newSurvey.ipfsHash = _ipfsHash;
        newSurvey.surveyDeadline = _surveyDeadline;
        newSurvey.numChoices = _numChoices;
        newSurvey.atMostChoice = _atMostChoice;
        newSurvey.owner = msg.sender;
        newSurvey.surveyId = surveyId;
        index += 1;
        surveyAmount += 1;

        return surveyId;
    }

    // let only government member can take survey and
    // choices length should be smaller than atMostChoice and
    // it adds choices to survey choices
    function takeSurvey(
        uint surveyid,
        uint[] memory choices
    ) public onlyMyGovMember {
        require(choices.length <= surveys[surveyid].atMostChoice);
        surveys[surveyid].choices[msg.sender] = choices;
        for (uint i = 0; i < choices.length; i++) {
            surveys[surveyid].surveyChoices.push(choices[i]);
        }
        surveys[surveyid].numofTaken += 1;
    }

    // returns info about survey
    function getSurveyResults(
        uint surveyid
    ) public view returns (uint numtaken, uint[] memory results) {
        Survey storage survey = surveys[surveyid];
        uint[] storage _results = survey.surveyChoices;
        return (survey.numofTaken, _results);
    }

    // returns survey owner
    function getSurveyOwner(
        uint surveyid
    ) public view returns (address surveyowner) {
        return surveys[surveyid].owner;
    }

    // checks voteDeadline
    // takes 5 MyGov and 50 USD Token from proposal owner
    // adds proposal to the contract proposals
    function submitProjectProposal(
        string memory ipfshash,
        uint votedeadline,
        uint[] memory paymentamounts,
        uint[] memory payschedule
    ) public onlyMyGovMember returns (uint projectid) {
        require(votedeadline > block.timestamp);
        require(
            IERC20(MyGov).transferFrom(msg.sender, address(this), 5 * (1e18))
        );
        require(
            IERC20(USDToken).transferFrom(
                msg.sender,
                address(this),
                50 * (1e18)
            )
        );

        projectid = proposalIndex;
        Proposal storage newProposal = proposals[projectid];
        newProposal.ipfsHash = ipfshash;
        newProposal.voteDeadLine = votedeadline;
        newProposal.paymentAmounts = paymentamounts;
        newProposal.paySchedule = payschedule;
        newProposal.owner = msg.sender;
        newProposal.funded = false;
        newProposal.fundReserved = 0;
        newProposal.noOfVotes = 0;
        proposalIndex += 1;
        return projectid;
    }

    // checks whether %10 of the member votes yes and there is enough USD token
    function getIsProjectFunded(
        uint projectid
    ) public view returns (bool funded) {
        bool isFunded;

        Proposal storage proposal = proposals[projectid];
        if (10 * proposal.noOfTrue >= memberAmount ) {
            isFunded = true;
        }

        uint totalPayments = 0;

        for (uint i = 0; i < proposal.paymentAmounts.length; i++) {
            totalPayments += proposal.paymentAmounts[i];
        }

        return
            isFunded &&
            (IERC20(USDToken).balanceOf(address(this)) > totalPayments);
    }

    // checks proposal deadline and vote right of the msg sender
    // adds vote to proposal votes and decreases the vote amount
    function voteForProjectProposal(
        uint projectid,
        bool choice
    ) public onlyMyGovMember {
        Proposal storage proposal = proposals[projectid];
        if (proposal.votedYet[msg.sender] == false) {
            proposal.voteAmountProposal[msg.sender] ++;

        }else{
                require(
                proposal.voteAmountProposal[msg.sender] > 0,
                "You do not have vote right"
            );
        }
        require(
            proposal.voteDeadLine >= block.timestamp,
            "Voting deadline has passed"
        );

        proposal.votes[msg.sender] = choice;
        if (proposal.voteAmountProposal[msg.sender] > 0 && (proposal.votedYet[msg.sender] == true)) {            
            proposal.voteAmountProposal[msg.sender] -= 1;
        }
        proposal.votedYet[msg.sender] = true;
        if (choice) {
            proposal.noOfTrue++;
        }
    }

    // checks whether 10% of the members vote yes and 1% of the members vote yes for payment
    // returns next payment
    function getProjectNextPayment(
        uint projectid
    ) public view returns (uint next) {
        Proposal storage proposal = proposals[projectid];

        bool funded;

        funded =
            (proposal.noOfTruePayment >= memberAmount / 100) &&
            (proposal.noOfTrue >= memberAmount / 10);
        if (funded) {
            return proposal.paymentAmounts[proposal.paymentIndex + 1];
        }
    }

    // returns project info of the proposal
    function getProjectInfo(
        uint projectid
    )
        public
        view
        returns (
            string memory ipfshash,
            uint votedeadline,
            uint[] memory paymentamounts,
            uint[] memory payschedule
        )
    {
        Proposal storage proposal = proposals[projectid];
        return (
            proposal.ipfsHash,
            proposal.voteDeadLine,
            proposal.paymentAmounts,
            proposal.paySchedule
        );
    }

    // checks proposals funded situation
    function getNoOfFundedProjects() public view returns (uint numfunded) {
        uint count = 0;

        for (uint i = 0; i < proposalIndex; i++) {
            Proposal storage proposal = proposals[i];
            if (
                (proposal.noOfTruePayment >= memberAmount / 100) &&
                (proposal.noOfTrue >= memberAmount / 10)
            ) {
                count++;
            }
        }
        return count;
    }

    // returns withdrawed amount for the project
    function getUSDReceivedByProject(
        uint projectid
    ) public view returns (uint amount) {
        Proposal storage proposal = proposals[projectid];

        return proposal.withdrawedAmount;
    }

    // checks whether project is funded, deadline is not passed and the user is owner
    // reserves the total payment
    function reserveProjectGrant(uint projectid) public {
        Proposal storage proposal = proposals[projectid];
        require(msg.sender == proposal.owner);
        require(
            proposal.voteDeadLine > block.timestamp,
            "Voting deadline has passed"
        );

        // checks if at least 1/10 of the members voted yes
        require(getIsProjectFunded(projectid));
        proposal.funded = true;

        uint totalPayments = 0;

        for (uint i = 0; i < proposal.paymentAmounts.length; i++) {
            totalPayments += proposal.paymentAmounts[i];
        }

        // checks if there is sufficient USD stable coin in the contract
        require(
            IERC20(USDToken).balanceOf(address(this)) >= totalPayments,
            "Insufficient USD stable coin in the contract"
        );

        // reserved the total payment
        proposal.fundReserved += totalPayments;
    }

    // checks whether the user is owner, payschedule is reached and project is funded
    // reduces reserved fund and increases withdrawed amount by payment amount
    function withdrawProjectPayment(uint projectid) public {
        Proposal storage proposal = proposals[projectid];
        require(
            msg.sender == proposal.owner,
            "Only the project owner can withdraw the payment"
        );
        require(
            block.timestamp >= proposal.paySchedule[proposal.paymentIndex],
            "Payment schedule not reached"
        );

        bool funded = (100 * proposal.noOfTruePayment >= memberAmount) &&
            (10 * proposal.noOfTrue >= memberAmount );

        if (funded) {
            IERC20(USDToken).transfer(
                proposal.owner,
                proposal.paymentAmounts[proposal.paymentIndex]
            );
            proposal.fundReserved -= proposal.paymentAmounts[
                proposal.paymentIndex
            ];
        } else {
            proposal.funded = false;
        }
        proposal.withdrawedAmount += proposal.paymentAmounts[
            proposal.paymentIndex
        ];
    }

    // checks proposal deadline and vote right of the msg sender
    // adds vote to proposal votes and decreases the vote amount
    function voteForProjectPayment(
        uint projectid,
        bool choice
    ) public onlyMyGovMember {
        Proposal storage proposal = proposals[projectid];
        if(proposal.votedPaymentYet[msg.sender] == false){
            proposal.voteAmountPayment[msg.sender]++;
        }else{
                require(
                proposal.voteAmountPayment[msg.sender] > 0,
                "You do not have vote right"
            );
        }
        require(block.timestamp < proposal.voteDeadLine, "Deadline has passed");

        proposal.votes[msg.sender] = choice;
        proposal.votedPaymentYet[msg.sender] = true;
        if (choice) {
            proposal.noOfTruePayment++;
        }
        if (proposal.voteAmountPayment[msg.sender] > 0) {
            proposal.voteAmountPayment[msg.sender] -= 1;
        }
    }

    // checks delegatee and msg sender are MyGov member or not and voting deadline
    // reduces voteAmount for sender and increases for delegatee
     function delegateVoteTo(
        address memberaddr,
        uint projectid
    ) public onlyMyGovMember {
        require(
            balanceOf(memberaddr) >= 1e18,
            "Delegatee is not a MyGov member or balance is zero"
        );

        Proposal storage proposal = proposals[projectid];
        require(
            proposal.voteDeadLine >= block.timestamp,
            "Voting deadline has passed"
        );
        if (proposal.votedYet[msg.sender] == true) {
            require(proposal.voteAmountProposal[msg.sender] >0, "You already voted");
        }
        if (proposal.votedPaymentYet[msg.sender] == true) {
            require(proposal.voteAmountPayment[msg.sender] > 0, "You already voted");
        }
        if (proposal.voteAmountProposal[msg.sender] > 0) {
            proposal.voteAmountProposal[msg.sender] -= 1;
        }
        if (proposal.voteAmountPayment[msg.sender] > 0) {
            proposal.voteAmountPayment[msg.sender] -= 1;
        }

        proposal.voteAmountProposal[memberaddr] += 1;

        proposal.voteAmountPayment[memberaddr] += 1;
        proposal.votedYet[msg.sender] = true;
        proposal.votedPaymentYet[msg.sender] = true;
    }

    // returns info about survey info
    function getSurveyInfo(
        uint _surveyid
    )
        public
        view
        returns (
            string memory ipfshash,
            uint surveydeadline,
            uint numchoices,
            uint atmostchoice
        )
    {
        Survey storage survey = surveys[_surveyid];
        return (
            survey.ipfsHash,
            survey.surveyDeadline,
            survey.numChoices,
            survey.atMostChoice
        );
    }

    // returns owner of the proposal
    function getProjectOwner(
        uint projectid
    ) public view returns (address projectowner) {
        Proposal storage proposal = proposals[projectid];
        return proposal.owner;
    }

    // returns number of proposals using proposal index
    function getNoOfProjectProposals() public view returns (uint numproposals) {
        return proposalIndex;
    }

    // returns number of surveys using proposal index
    function getNoOfSurveys() public view returns (uint numsurveys) {
        return surveyAmount;
    }

    // overrides transfer function to check member status of the sender or receiver and changes member count according to balances
    function transfer(
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        address owner = _msgSender();
        address from = msg.sender;
        _transfer(owner, to, value);
        if (balanceOf(to) >= 1e18 && !isMember[to]) {
            memberAmount++;
            isMember[to] = true;
        }
        if (balanceOf(from) < 1e18 && isMember[from]) {
            memberAmount -= 1;
            isMember[from] = false;
        }
        return true;
    }
}
