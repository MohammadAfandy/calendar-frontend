<template>
  <v-row class="fill-height">
    <v-col v-if="!isLoggedIn">
      <v-btn
        outlined
        href="http://192.168.0.101:9001/api/auth/google/login"
      >
      <v-icon left>mdi-google</v-icon>
      Sign In
      </v-btn>
    </v-col>
    <v-col v-else>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn color="primary" outlined class="mr-4" @click="addEvent">Add</v-btn>
          <v-menu
            ref="menuMonth"
            v-model="menuMonth"
            :close-on-content-click="false"
            :return-value.sync="month"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                outlined
              >
              <v-icon left>mdi-calendar</v-icon>
              Change
              </v-btn>
            </template>
            <v-date-picker
              v-model="month"
              type="month"
              no-title
              scrollable
              @change="changeMonth"
            >
              <v-spacer></v-spacer>
              <!-- <v-btn
                text
                color="primary"
                @click="menuMonth = false"
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="changeMonth"
              >
                OK
              </v-btn> -->
            </v-date-picker>
          </v-menu>
          <v-spacer></v-spacer>
          <v-btn outlined class="mr-4" @click="setToday">Today</v-btn>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          locale="id"
          :events="events"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="addEvent"
          @change="updateRange"
        ></v-calendar>
        <v-menu
          v-model="hoveredOpen"
          :close-on-content-click="false"
          :close-on-click="false"
          :activator="hoveredElement"
          full-width
          offset-x
        >
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="hoveredEvent.color" dark>
              <v-toolbar-title>
                <div>{{ hoveredEvent.name }}</div>
                <div>{{ moment(hoveredEvent.startDate).format('HH:mm') }} - {{ moment(hoveredEvent.endDate).format('HH:mm') }}</div>
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="hoveredOpen = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <form>
                <v-row>
                  <span v-html="hoveredEvent.detail"></span>
                </v-row>
              </form>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
    <v-dialog v-model="modal" max-width="800px">
      <v-form @submit.prevent="submitEvent">
        <v-card>
          <v-card-title class="justify-center">
            <span class="headline">{{ modalTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" lg="6" sm="12">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        :value="form.name"
                        @change="form.name = $event"
                        label="Name"
                        required
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        :value="form.detail"
                        @change="form.detail = $event"
                        label="Detail"
                        required
                        ></v-textarea>
                    </v-col>
                    <v-col cols="6">
                      <v-menu
                        ref="menuStartDate"
                        v-model="menuStartDate"
                        :close-on-content-click="false"
                        :return-value.sync="form.startDate"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.startDate"
                            label="Start Date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="form.startDate"
                          no-title
                          scrollable
                        >
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            color="primary"
                            @click="menuStartDate = false"
                          >
                            Cancel
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.menuStartDate.save(form.startDate)"
                          >
                            OK
                          </v-btn>
                        </v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="6">
                      <v-menu
                        ref="menuStartTime"
                        v-model="menuStartTime"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        :return-value.sync="form.startTime"
                        transition="scale-transition"
                        offset-y
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.startTime"
                            label="Start Time"
                            prepend-icon="mdi-clock-time-four-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-time-picker
                          v-if="menuStartTime"
                          v-model="form.startTime"
                          full-width
                          @click:minute="$refs.menuStartTime.save(form.startTime)"
                        ></v-time-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="6">
                      <v-menu
                        ref="menuEndDate"
                        v-model="menuEndDate"
                        :close-on-content-click="false"
                        :return-value.sync="form.endDate"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.endDate"
                            label="End Date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="form.endDate"
                          no-title
                          scrollable
                        >
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            color="primary"
                            @click="menuEndDate = false"
                          >
                            Cancel
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.menuEndDate.save(form.endDate)"
                          >
                            OK
                          </v-btn>
                        </v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="6">
                      <v-menu
                        ref="menuEndTime"
                        v-model="menuEndTime"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        :return-value.sync="form.endTime"
                        transition="scale-transition"
                        offset-y
                        max-width="290px"
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="form.endTime"
                            label="End Time"
                            prepend-icon="mdi-clock-time-four-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-time-picker
                          v-if="menuEndTime"
                          v-model="form.endTime"
                          full-width
                          @click:minute="$refs.menuEndTime.save(form.endTime)"
                        ></v-time-picker>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col  cols="12" lg="6" sm="12">
                  <v-row>
                    <v-col cols="12">
                      <v-color-picker hide-mode-switch v-model="form.color" label="Color"></v-color-picker>
                    </v-col>
                    <v-col cols="12">
                      <v-combobox
                        v-model="form.tags"
                        :items="tag.items"
                        :search-input.sync="tag.search"
                        hide-selected
                        label="Tags"
                        multiple
                        persistent-hint
                        small-chips
                      >
                        <template v-slot:no-data>
                          <v-list-item>
                            <v-list-item-content>
                              <v-list-item-title>
                                No results matching "<strong>{{ tag.search }}</strong>". Press <kbd>enter</kbd> to create a new one
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                        </template>
                      </v-combobox>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="modal = false">Close</v-btn>
            <v-btn v-if="form._id" color="error" @click="deleteEvent">Delete</v-btn>
            <v-btn color="success" type="submit">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-row>
</template>

<script>
import Api from '@/services/api';
import moment from 'moment';

export default {
  props: [
    'isLoggedIn',
  ],
  computed: {
    // isLoggedIn() {
    //   console.log("this.$route", this.$route)
    //   console.log("this.$router", this.$router)
    //   console.log("oislog", localStorage.getItem('token') != null)
    //   return localStorage.getItem('token') != null;
    // },
    title() {
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      let sameMonthYear = false;

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);

      const startYear = start.year;
      const endYear = end.year;

      if (startMonth === endMonth && startYear === endYear) {
        sameMonthYear = true;
      }

      // const startDay = start.day + this.nth(start.day);
      // const endDay = end.day + this.nth(end.day);
      const startDay = start.day;
      const endDay = end.day;

      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
          return sameMonthYear ? `${startDay} - ${endDay} ${startMonth} ${startYear}` : `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
        case "day":
          return ` ${startDay} ${startMonth} ${startYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long"
      });
    }
  },
  mounted() {
    this.getEvents();
  },
  methods: {
    async getEvents() {
      let { data: events } = await Api().get('/api/events', {
        params: {
          startDate: this.start.date,
          endDate: this.end.date,
          // name,
          // tags,
        }
      });
      events = events.map((event) => ({
        ...event,
        start: moment(event.startDate).format('YYYY-MM-DD HH:mm'),
        end: moment(event.endDate).format('YYYY-MM-DD HH:mm'),
      }));
      this.events = events;

      let tags = new Set([...this.tag.items]);
      events.forEach((v) => {
        tags = new Set([ ...tags, ...v.tags]);
      });
      this.tag.items = [...tags];
    },
    changeMonth() {
      this.$refs.menuMonth.save(this.month);
      this.focus = moment(this.month).format('YYYY-MM-DD');
    },
    getRandomColor() {
      return Math.floor(Math.random() * 16777215).toString(16);
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    resetForm() {
      this.form._id = null;
      this.form.name = "";
      this.form.detail = "";
      this.form.tags = [];
      this.form.startDate = "";
      this.form.startTime = "";
      this.form.endDate = "";
      this.form.endTime = "";
      this.form.color = this.getRandomColor();
    },
    addEvent({ date }) {
      this.resetForm();
      this.form.startDate = date;
      this.form.endDate = date;
      this.modalTitle = 'Add New Event';
      this.modal = true;
    },
    showDetail({ nativeEvent, event }) {
      const open = () => {
        this.hoveredEvent = event;
        this.hoveredElement = nativeEvent.target;
        setTimeout(() => (this.hoveredOpen = true), 10);
      };
      if (this.hoveredOpen) {
        this.hoveredOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }
      nativeEvent.stopPropagation();
    },
    closeDetail() {
      this.hoveredOpen = false;
    },
    showEvent({ nativeEvent, event }) {
      if (this.hoveredOpen) this.hoveredOpen = false;
      this.form._id = event._id;
      this.form.name = event.name;
      this.form.detail = event.detail;
      this.form.tags = event.tags;
      this.form.startDate = moment(event.startDate).format('YYYY-MM-DD');
      this.form.startTime = moment(event.startDate).format('HH:mm');
      this.form.endDate = moment(event.endDate).format('YYYY-MM-DD');
      this.form.endTime = moment(event.endDate).format('HH:mm');
      this.form.color = event.color;
      this.modalTitle = 'Edit Event';
      this.modal = true;
      console.log("this.form._id", this.form._id);
      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
      this.start = start;
      this.end = end;
      this.getEvents()
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },
    async submitEvent() {
      try {
        const dataEvent = {
          ...this.form,
          startDate: moment(this.form.startDate + ' ' + this.form.startTime).format('YYYY-MM-DD HH:mm:ss'),
          endDate: moment(this.form.endDate + ' ' + this.form.endTime).format('YYYY-MM-DD HH:mm:ss'),
        };
        delete dataEvent._id;
        if (this.form._id) {
          await Api().put('/api/events/' + this.form._id, dataEvent);
        } else {
          await Api().post('/api/events', dataEvent);
        }
        this.getEvents();
        this.modal = false;
      } catch(err) {
        if (err.response.status === 422) {
          alert(err.response.data.error.map((v) => v.message).join('\n'));
        } else {
          alert(err.response.data.message);
        }
      }
    },
    async deleteEvent() {
      try {
        await Api().delete('/api/events/' + this.form._id);
        this.getEvents();
        this.modal = false;
      } catch (err) {
        if (err.response.status === 422) {
          alert(err.response.data.error.map((v) => v.message).join('\n'));
        } else {
          alert(err.response.data.message);
        }
      }
    }
  },
  data() {
    return {
      today: moment().format('YYYY-MM-DD'),
      focus: moment().format('YYYY-MM-DD'),
      month: moment().format('YYYY-MM'),
      menuMonth: false,
      type: "month",
      typeToLabel: {
        month: "Month",
        week: "Week",
        day: "Day",
      },
      form: {
        _id: null,
        name: null,
        detail: null,
        tags: [],
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        color: this.getRandomColor(),
      },
      start: null,
      end: null,
      hoveredEvent: {},
      hoveredOpen: false,
      hoveredElement: null,
      events: [],
      modal: false,
      modalTitle: 'Add New Event',
      tag: {
        items: ['Work', 'Study', 'Play'],
        search: null,
      },
      menuStartDate: false,
      menuStartTime: false,
      menuEndDate: false,
      menuEndTime: false,
    };
  },
};
</script>
