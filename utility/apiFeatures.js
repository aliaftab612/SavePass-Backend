class APIFeatures {
  constructor(query, generalPasswords) {
    this.query = query;
    this.generalPasswords = generalPasswords;
  }

  filter() {
    if (this.query.filter) {
      this.generalPasswords = this.generalPasswords.filter(
        (element) =>
          element.website.includes(this.query.filter) ||
          element.username.includes(this.query.filter)
      );
    }

    return this;
  }

  sortByDateCreatedOrDateUpdated() {
    if (
      !(
        this.query.sort === 'dateCreated' ||
        this.query.sort === 'dateUpdated' ||
        this.query.sort === '-dateCreated' ||
        this.query.sort === '-dateUpdated'
      )
    ) {
      this.query.sort = '-dateCreated';
    }

    if (this.query.sort.charAt(0) === '-') {
      this.generalPasswords.sort((a, b) => {
        if (a[this.query.sort.slice(1)] > b[this.query.sort.slice(1)]) {
          return -1;
        } else if (
          a[this.query.sort.slice(1)] === b[this.query.sort.slice(1)]
        ) {
          return 0;
        }

        return 1;
      });
    } else {
      this.generalPasswords.sort((a, b) => {
        if (a[this.query.sort] < b[this.query.sort]) {
          return -1;
        } else if (a[this.query.sort] === b[this.query.sort]) {
          return 0;
        }

        return 1;
      });
    }

    return this;
  }

  paginate() {
    const page = this.query.page ? Number(this.query.page) : 1;
    const limit = this.query.limit ? Number(this.query.limit) : 10;

    this.query.page = page;
    this.query.limit = limit;

    const startIndex = (page - 1) * limit;

    this.generalPasswords = this.generalPasswords.splice(startIndex, limit);

    return this;
  }
}

module.exports = APIFeatures;
