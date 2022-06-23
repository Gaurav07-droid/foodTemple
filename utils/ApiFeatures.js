class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    //FILTERING
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // exculding feilds delete from queryobj forEach.delete

    //advance filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    //SORTING
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-ratingsAverage');
    }
    return this;
  }

  limitingFields() {
    // LIMITING;
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    // PAGINATION
    const page = this.queryStr.page * 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    if (this.queryStr.page) {
      const numRestos = this.query.countDocuments();
      if (skip > numRestos) throw new Error('This page doesnot exists');
    }
    return this;
  }
}

module.exports = ApiFeatures;
