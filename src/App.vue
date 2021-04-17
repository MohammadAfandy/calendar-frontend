<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="./assets/calendar.png"
          transition="scale-transition"
          width="40"
        />
      </div>
      <span>CALENDAR APP</span>
      <v-spacer></v-spacer>
      <v-menu offset-y transition="slide-y-transition" bottom>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" text>{{ email }}</v-btn>
        </template>

        <v-list>
          <v-list-item @click="openProfile">
            Profile
          </v-list-item>
          <v-list-item @click="logout">
            Logout
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-dialog
      v-model="profileDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card tile>
        <v-toolbar
          flat
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="profileDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Settings</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              dark
              text
              @click="updateProfile"
            >
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-list
            three-line
            subheader
          >
            <v-subheader>User Profile</v-subheader>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Full Name</v-list-item-title>
                <v-list-item-subtitle>{{ fullname }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-list
            three-line
            subheader
          >
            <v-subheader>Reminder</v-subheader>
            <!-- <v-list-item>
              <v-list-item-action>
                <v-checkbox v-model="whatsappNotification"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Whatsapp Notification</v-list-item-title>
                <v-list-item-subtitle>
                  <v-col cols="12" sm="12" md="6" lg="6">
                    <v-text-field
                      :value="phoneNumber"
                      @change="phoneNumber = $event"
                      label="Whatsapp Number"
                      ></v-text-field>
                    </v-col>
                </v-list-item-subtitle>
                <v-list-item-subtitle>Notify me my events via whatsapp</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item> -->
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-action>
                <v-checkbox v-model="telegramNotification"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Telegram Notification</v-list-item-title>
                <v-list-item-subtitle>
                  <v-col cols="12" sm="12" md="6" lg="6">
                    <v-text-field
                      :value="telegramAccount"
                      @change="telegramAccount = $event"
                      label="Telegram Account"
                      ></v-text-field>
                    </v-col>
                </v-list-item-subtitle>
                <v-list-item-subtitle>Notify me my events via telegram</v-list-item-subtitle>
                <v-list-item-subtitle v-if="telegramLink">
                  Please click the button below to link your telegram account
                </v-list-item-subtitle>
                 <v-list-item-subtitle v-if="telegramLink">
                  <v-btn
                    icon
                    outlined
                    :href="telegramLink"
                    target="_blank"
                  >
                    <v-icon>mdi-telegram</v-icon>
                  </v-btn>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>

        <div style="flex: 1 1 auto;"></div>
      </v-card>
    </v-dialog>

    <v-content>
      <Container :isLoggedIn="isLoggedIn" />
    </v-content>
  </v-app>
</template>

<script>
import Container from './components/Container';
import Api from '@/services/api';

export default {
  name: 'App',
  mounted() {
    this.setToken();
    this.setProfile();
  },
  computed: {
    // profile() {
    //   return {
    //     username: this.username,
    //     fullname: this.fullname,
    //     email: this.email,
    //   }
    // },
    isLoggedIn() {
      // console.log("this.$route", this.$route)
      // console.log("this.$router", this.$router)
      // console.log("oislog", localStorage.getItem('token') != null)
      // return localStorage.getItem('token') != null;
      return this.token;
    },
  },
  methods: {
    setToken() {
      const token = this.$route.query.token;
      if (token) {
        this.token = token;
        localStorage.setItem('token', token);
      }
    },
    fillProfile(data) {
      this.username = data.username;
      this.fullname = data.fullname;
      this.email = data.email;
      this.phoneNumber = data.phoneNumber;
      this.telegramAccount = data.telegramAccount;
      this.telegramLink = data.telegramLink;
      this.whatsappNotification = data.whatsappNotification;
      this.telegramNotification = data.telegramNotification;
    },
    async setProfile() {
      try {
        if (this.token) {
          const { data } = await Api().get('/api/auth/me');
          this.fillProfile(data);
        }
      } catch(err) {
        alert(err.response.data.message);
      }
    },
    async openProfile() {
      await this.setProfile();
      this.profileDialog = true;
    },
    async updateProfile() {
      try {
        await Api().post('/api/auth/me', {
          phoneNumber: this.phoneNumber,
          telegramAccount: this.telegramAccount,
          whatsappNotification: this.whatsappNotification,
          telegramNotification: this.telegramNotification,
        });
        this.profileDialog = false;
      } catch(err) {
        if (err.response.status === 422) {
          alert(err.response.data.error.map((v) => v.message).join('\n'));
        } else {
          alert(err.response.data.message);
        }
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.token = null;
      this.username = null;
      this.fullname = null;
      this.email = null;
      this.$router.push('/');
    }
  },
  components: {
    Container,
  },
  data: () => ({
    token: localStorage.getItem('token'),
    username: null,
    fullname: null,
    email: null,
    phoneNumber: null,
    telegramAccount: null,
    whatsappNotification: false,
    telegramNotification: false,
    telegramLink: null,
    profileDialog: false,
  }),
};
</script>
