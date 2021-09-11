const bcrypt = require('bcryptjs');
const OAuthTokensModel = require('../models').OAuthTokens;
const OAuthClientsModel = require('../models').OAuthClients;
const OAuthUsersModel = require('../models').OAuthUsers;
const EPresenceModel = require('../models').EPresence;

module.exports.getAccessToken = function (bearerToken) {
	return OAuthTokensModel.findOne(
		{
			where: {
				accessToken: bearerToken
			},
			include: [
				{
					model: OAuthClientsModel,
					as: 'client'
				},
				{
					model: OAuthUsersModel,
					as: 'user'
				}
			]
		})
		.then((token) => {
			const data = new Object();
			for (const prop in token.get()) data[prop] = token[prop];
			data.client = data.client.get();
			data.user = data.user.get();
			return data;
		})
		.catch((error) => { console.error(error); return error });
};

module.exports.getClient = function (clientId, clientSecret) {
	return OAuthClientsModel.findOne({where: {clientId: clientId, clientSecret: clientSecret}, raw: true});
};

module.exports.getRefreshToken = function (refreshToken) {
	return OAuthTokensModel.findOne(
		{
			where: {
				refreshToken: refreshToken
			},
			include: [
				{
					model: OAuthClientsModel,
					as: 'client'
				},
				{
					model: OAuthUsersModel,
					as: 'user'
				}
			]
		})
		.then((token) => {
			const data = new Object();
			for (const prop in token.get()) data[prop] = token[prop];
			data.client = data.client.get();
			data.user = data.user.get();
			return data;
		})
		.catch((error) => { console.error(error); return error });
};

module.exports.getUser = function (email, password) {
	return OAuthUsersModel.findOne({where: {email: email}})
		.then((user) => {
			const isMatch = bcrypt.compareSync(password, user.get().password);
			if (isMatch) {
				return user.get();
			} else {
				console.error("Password not match");
			}
		});
};

module.exports.saveToken = function (token, client, user) {
	return OAuthTokensModel
		.create(
			{
				accessToken: token.accessToken,
				accessTokenExpiresAt: token.accessTokenExpiresAt,
				clientId: client.id,
				refreshToken: token.refreshToken,
				refreshTokenExpiresAt: token.refreshTokenExpiresAt,
				userId: user.id
			}
		)
		.then((token) => {
			const data = new Object();
			for (const prop in token.get()) data[prop] = token[prop];
			data.client = data.clientId;
			data.user = data.userId;

			return data;
		})
		.catch((error) => { console.error(error); return error });
};

module.exports.revokeToken = function (token) {
	console.log("Revoke token");
	return OAuthTokensModel
		.findOne({where: {refreshToken: token.refreshToken}})
		.then(refreshToken => {
			console.log(refreshToken);
			return refreshToken
				.destroy()
				.then(() => {
					return !!refreshToken
				})
				.catch((error) => { console.error(error); return error });
		})
		.catch((error) => { console.error(error); return error });
};

module.exports.setClient = function (client) {
	return OAuthClientsModel
		.create({
			clientId: client.clientId,
			clientSecret: client.clientSecret,
			redirectUris: client.redirectUris,
			grants: client.grants,
		})
		.then((client) => {
			client = client && typeof client == 'object' ? client.toJSON() : client;
			const data = new Object();
			for (const prop in client) data[prop] = client[prop];
			data.client = data.clientId;
			data.grants = data.grants;

			return data;
		})
		.catch((error) => { console.error(error); return error });
};

// Throw error if required is empty
// Throw error if email/npp already exists [DONE], show to user
module.exports.setUser = function (user) {
	return OAuthUsersModel
		.create({
			nama: user.nama,
			email: user.email,
			npp: user.npp,
			npp_supervisor: user.npp_supervisor,
			password: user.password,
			name: user.name
		})
		.then((userResult) => {
			userResult = userResult && typeof userResult == 'object' ? userResult.toJSON() : userResult;
			const data = new Object();
			for (const prop in userResult) data[prop] = userResult[prop];
			data.nama = data.nama;
			data.email = data.email;
			data.npp = data.npp;
			data.npp_supervisor = data.npp_supervisor;
			data.name = data.name;

			return data;
		})
		.catch((error) => { console.error(error); return error });
};

module.exports.setAttendance = function (authorization, presence) {
	return OAuthTokensModel.findOne({
		where: {
			accessToken: authorization.split(' ')[1]
		},
		include: [
			{
				model: OAuthClientsModel,
				as: 'client'
			},
			{
				model: OAuthUsersModel,
				as: 'user'
			}
		]
	})
	.then((token) => {
		const data = new Object();
		for (const prop in token.get()) data[prop] = token[prop];
		data.client = data.client.get();
		data.user = data.user.get();
		return EPresenceModel.create({
			id_user: data.userId,
			type: presence.type,
			is_approve: false,
			waktu: presence.waktu
		})
		.then((userResult) => {
			userResult = userResult && typeof userResult == 'object' ? userResult.toJSON() : userResult;
			const data = new Object();
			for (const prop in userResult) data[prop] = userResult[prop];
			data.id_user = data.id_user;
			data.type = data.type;
			data.is_approve = data.is_approve;
			data.waktu = data.waktu;

			return data;
		})
		.catch((error) => { console.error(error); return error });
	})
	.catch((error) => { console.error(error); return error });
};

module.exports.getAttendance = function (authorization) {
	return OAuthTokensModel.findOne({
		where: {
			accessToken: authorization.split(' ')[1]
		},
		include: [
			{
				model: OAuthClientsModel,
				as: 'client'
			},
			{
				model: OAuthUsersModel,
				as: 'user'
			}
		]
	})
	.then((token) => {
		const data = new Object();
		for (const prop in token.get()) data[prop] = token[prop];
		data.client = data.client.get();
		data.user = data.user.get();
		return EPresenceModel.findAll({
			where: {
				id_user: data.userId
			}
		})
		.then((presenceResult) => {
			var presenceArray = [];
			for (var i = 0; i < presenceResult.length; i++) {
				let activePresenceResult = presenceResult[i];
				activePresenceResult = activePresenceResult && typeof activePresenceResult == 'object' ? activePresenceResult.toJSON() : activePresenceResult;
				let data = new Object();
				for (const prop in activePresenceResult) data[prop] = activePresenceResult[prop];
				data.id_user = data.id_user;
				data.type = data.type;
				data.is_approve = data.is_approve;
				data.waktu = data.waktu;
				presenceArray.push(data);
			}

			return {
				'data': presenceArray
			};
		})
		.catch((error) => { console.error(error); return error });
	})
	.catch((error) => { console.error(error); return error });
};
