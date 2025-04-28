/* istanbul ignore file */
const EndpointTestHelper = {
  async generateAccessToken(server) {
    const userPayload = {
      username: "user_dummy",
      password: "user_dummy123",
      fullname: "User Testing",
    };

    const responseRegisterUser = await server.inject({
      method: "POST",
      url: "/users",
      payload: userPayload,
    });

    console.log(responseRegisterUser.result);

    const {
      addedUser: { id: owner },
    } = JSON.parse(responseRegisterUser.payload).data;

    const authPayload = {
      username: userPayload.username,
      password: userPayload.password,
    };

    const responseAuth = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: authPayload,
    });

    const { accessToken } = JSON.parse(responseAuth.payload).data;

    return { accessToken, owner };
  },
};

module.exports = EndpointTestHelper;
