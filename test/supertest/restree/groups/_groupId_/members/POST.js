exports.handler = function(req,res) {
	res.status(200).send("Added a new member to group " + req.params.groupId);
}
