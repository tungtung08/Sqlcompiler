import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.*;

public class SqlConsoleApp extends JFrame {
    private JTextArea queryInput;
    private JTable outputTable;
    private DefaultTableModel tableModel;

    // Apne MySQL database ki details yahan bharein
    private static final String DB_URL = "jdbc:mysql://localhost:3306/your_database_name";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "your_password";

    public SqlConsoleApp() {
        setTitle("Java MySQL Console (A to Z Query Runner)");
        setSize(900, 650);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        // --- Top Panel (Query Input) ---
        JPanel topPanel = new JPanel(new BorderLayout(5, 5));
        topPanel.setBorder(BorderFactory.createEmptyBorder(15, 15, 0, 15));
        
        JLabel label = new JLabel("Enter SQL Query (CREATE, INSERT, SELECT, DESC, UPDATE, DROP, etc.):");
        label.setFont(new Font("Segoe UI", Font.BOLD, 14));
        topPanel.add(label, BorderLayout.NORTH);

        queryInput = new JTextArea(6, 20);
        queryInput.setFont(new Font("Consolas", Font.PLAIN, 14));
        queryInput.setLineWrap(true);
        JScrollPane scrollPane = new JScrollPane(queryInput);
        topPanel.add(scrollPane, BorderLayout.CENTER);

        // Buttons Panel
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 5));
        JButton runButton = new JButton("Run Query");
        runButton.setBackground(new Color(76, 175, 80));
        runButton.setForeground(Color.WHITE);
        runButton.setFont(new Font("Segoe UI", Font.BOLD, 13));

        JButton clearButton = new JButton("Clear Editor");
        clearButton.setBackground(new Color(100, 100, 100));
        clearButton.setForeground(Color.WHITE);
        clearButton.setFont(new Font("Segoe UI", Font.BOLD, 13));

        buttonPanel.add(runButton);
        buttonPanel.add(clearButton);
        topPanel.add(buttonPanel, BorderLayout.SOUTH);

        add(topPanel, BorderLayout.NORTH);

        // --- Center Panel (Output Table) ---
        JPanel centerPanel = new JPanel(new BorderLayout());
        centerPanel.setBorder(BorderFactory.createEmptyBorder(0, 15, 15, 15));
        
        JLabel outputLabel = new JLabel("Query Output:");
        outputLabel.setFont(new Font("Segoe UI", Font.BOLD, 14));
        centerPanel.add(outputLabel, BorderLayout.NORTH);

        tableModel = new DefaultTableModel();
        outputTable = new JTable(tableModel);
        outputTable.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        outputTable.setRowHeight(24);
        JScrollPane tableScroll = new JScrollPane(outputTable);
        centerPanel.add(tableScroll, BorderLayout.CENTER);

        add(centerPanel, BorderLayout.CENTER);

        // --- Event Listeners ---
        runButton.addActionListener(e -> executeQuery());
        clearButton.addActionListener(e -> queryInput.setText(""));
    }

    private void executeQuery() {
        String query = queryInput.getText().trim();

        if (query.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please enter an SQL query before running.", "Warning", JOptionPane.WARNING_MESSAGE);
            return;
        }

        // Query run hote hi text area turant erase (clear) ho jayega
        queryInput.setText("");

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
             Statement stmt = conn.createStatement()) {

            // MySQL me DESC/DESCRIBE natively support hota hai, par agar koi error aaye to handle ho jayega
            boolean isResultSet = stmt.execute(query);

            if (isResultSet) {
                // Agar query SELECT ya DESC hai (Data return karegi)
                try (ResultSet rs = stmt.getResultSet()) {
                    ResultSetMetaData metaData = rs.getMetaData();
                    int columnCount = metaData.getColumnCount();

                    // Table Columns Set karein
                    String[] columnNames = new String[columnCount];
                    for (int i = 1; i <= columnCount; i++) {
                        columnNames[i - 1] = metaData.getColumnName(i);
                    }
                    tableModel.setColumnIdentifiers(columnNames);
                    tableModel.setRowCount(0); // Purana data clear karein

                    int rowCount = 0;
                    while (rs.next()) {
                        Object[] rowData = new Object[columnCount];
                        for (int i = 1; i <= columnCount; i++) {
                            rowData[i - 1] = rs.getObject(i);
                        }
                        tableModel.addRow(rowData);
                        rowCount++;
                    }

                    // Detailed Success Popup
                    JOptionPane.showMessageDialog(this, 
                        "✔ Query executed successfully!\nTotal rows returned: " + rowCount, 
                        "Success", JOptionPane.INFORMATION_MESSAGE);
                }
            } else {
                // Agar query CREATE, INSERT, UPDATE, DROP, ALTER ho
                tableModel.setRowCount(0);
                tableModel.setColumnCount(0);

                JOptionPane.showMessageDialog(this, 
                    "✔ Query executed successfully! Database updated.", 
                    "Success", JOptionPane.INFORMATION_MESSAGE);
            }

        } catch (SQLException ex) {
            // Detailed Error Popup
            JOptionPane.showMessageDialog(this, 
                "SQL Execution Error:\n" + ex.getMessage(), 
                "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        // Look and Feel set karna taaki modern UI lage
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {}

        SwingUtilities.invokeLater(() -> {
            new SqlConsoleApp().setVisible(true);
        });
    }
             }
