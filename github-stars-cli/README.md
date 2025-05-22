# GitHub Stars CLI

This is a command-line interface (CLI) application that retrieves and displays the most starred GitHub projects within a specified date range using GitHub's Search API.

## Installation

To install the necessary dependencies, run the following command:

```
npm install
```

## Usage

You can run the application using Node.js. The application accepts two optional command-line arguments for the start and end dates in the format `YYYY-MM-DD`.

### Command Syntax

```
node github-stars.js [startDate] [endDate]
```

### Parameters

- `startDate` (optional): The start date for the date range (format: YYYY-MM-DD).
- `endDate` (optional): The end date for the date range (format: YYYY-MM-DD).

### Example

To get the most starred projects from January 1, 2023, to January 31, 2023, run:

```
node github-stars.js 2023-01-01 2023-01-31
```

If no dates are provided, the application will default to the last 30 days.

## License

This project is licensed under the MIT License.