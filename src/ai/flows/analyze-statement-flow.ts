// src/ai/flows/analyze-statement-flow.ts

/**
 * This is the primary analysis function that processes the extracted text 
 * from a financial statement. It uses a set of predefined rules to categorize 
 * assets and calculate the total portfolio value.
 *
 * @param statementText The full text content extracted from the PDF.
 * @returns An object containing the categorized portfolio values and the total value.
 */
export async function analyzeStatement(statementText: string) {
    const lines = statementText.split('\n');

    const portfolio = {
        Equity: 0,
        'Debt/Bonds': 0,
        Commodity: 0,
        Crypto: 0,
        Cash: 0,
        Others: 0,
    };

    // --- Asset Categorization Rules ---
    portfolio.Equity = extractValue(lines, ['equity', 'stock', 'shares', 'nifty', 'sensex']);
    portfolio['Debt/Bonds'] = extractValue(lines, ['bond', 'debt', 'fixed income', 'debenture', 'fd']);
    portfolio.Commodity = extractValue(lines, ['gold etf', 'sgb', 'silver', 'commodity']);
    portfolio.Crypto = extractValue(lines, ['bitcoin', 'ethereum', 'crypto']);
    portfolio.Cash = extractValue(lines, ['cash', 'bank balance', 'savings account']);
    portfolio.Others = extractValue(lines, ['reit', 'invit', 'pms', 'aif', 'other']);

    // --- Total Value Calculation ---
    const totalValue = Object.values(portfolio).reduce((sum, value) => sum + value, 0);

    // --- Percentage Calculation (Normalized) ---
    const normalizedPortfolio: { [key: string]: number } = {};
    if (totalValue > 0) {
        for (const key in portfolio) {
            normalizedPortfolio[key] = (portfolio[key as keyof typeof portfolio] / totalValue) * 100;
        }
    }

    return {
        ...normalizedPortfolio,
        TotalPortfolioValue: totalValue,
    };
}


/**
 * A helper function to scan through lines of text and extract the first
 * monetary value found on a line that contains any of the given keywords.
 *
 * This function uses a more robust regex to handle various number formats.
 *
 * @param lines An array of strings, where each string is a line from the statement.
 * @param keywords An array of keywords to search for (case-insensitive).
 * @returns The extracted numerical value, or 0 if no match is found.
 */
function extractValue(lines: string[], keywords: string[]): number {
    for (const line of lines) {
        const lowerLine = line.toLowerCase();

        if (keywords.some(keyword => lowerLine.includes(keyword))) {
            
            // Improved Regex: Handles integers, decimals, and comma-separators.
            // It looks for a number preceded by a space, colon, or Rupee symbol.
            const valueMatch = lowerLine.match(/(?:[\s:₹]|^)([\d,]*\.?[\d]+)/);
            
            if (valueMatch && valueMatch[1]) {
                const numericString = valueMatch[1].replace(/,/g, '');
                const value = parseFloat(numericString);
                if (!isNaN(value)) {
                    return value;
                }
            }
        }
    }
    return 0; // Return 0 if no value is found
}
