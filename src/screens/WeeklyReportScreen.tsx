
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useData } from '../contexts/DataContext';

const WeeklyReportScreen = () => {
    const { estudiantes } = useData();
    const [weeklyData, setWeeklyData] = useState([]);

    useEffect(() => {
        // Simulate fetching weekly attendance data and calculating stats
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const weekDays = Array.from({ length: 5 }, (_, i) => new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));
        
        const data = estudiantes.map(student => {
            const attendance = weekDays.map(day => {
                const statuses = ['A', 'I', 'IJ'];
                return { day: day.toISOString().split('T')[0], status: statuses[Math.floor(Math.random() * statuses.length)] };
            });

            const consecutiveAbsences = attendance.reduce((max, current, i, arr) => {
                if (current.status === 'I') {
                    return i > 0 && arr[i - 1].status === 'I' ? max + 1 : 1;
                }
                return max;
            }, 0);

            return {
                ...student,
                attendance,
                hasAlert: consecutiveAbsences >= 3 // Alert for 3 consecutive absences
            };
        });
        setWeeklyData(data);
    }, [estudiantes]);

    const totalAbsences = weeklyData.flatMap(s => s.attendance).filter(a => a.status === 'I').length;
    const totalJustified = weeklyData.flatMap(s => s.attendance).filter(a => a.status === 'IJ').length;
    const totalAttendance = weeklyData.flatMap(s => s.attendance).filter(a => a.status === 'A').length;
    const studentsWithAlerts = weeklyData.filter(s => s.hasAlert).length;

    return (
        <View style={styles.container}>
            <View style={styles.statsContainer}>
                <StatCard title="Asistentes" value={`${totalAttendance}`} percentage={`${(totalAttendance / (estudiantes.length * 5) * 100).toFixed(1)}%`} />
                <StatCard title="Ausentes" value={`${totalAbsences}`} percentage={`${(totalAbsences / (estudiantes.length * 5) * 100).toFixed(1)}%`} />
                <StatCard title="Justificadas" value={`${totalJustified}`} percentage={`${(totalJustified / (estudiantes.length * 5) * 100).toFixed(1)}%`} />
                <StatCard title="Alertas" value={`${studentsWithAlerts}`} percentage={`${(studentsWithAlerts / estudiantes.length * 100).toFixed(1)}%`} />
            </View>
            <ScrollView>
                {weeklyData.map(student => (
                    <View key={student.id} style={[styles.studentRow, student.hasAlert && styles.alertRow]}>
                        <Text style={styles.studentName}>{student.nombre}</Text>
                        {student.attendance.map(att => (
                            <Text key={att.day} style={{ color: att.status === 'A' ? 'green' : att.status === 'I' ? 'red' : 'orange' }}>
                                {att.status}
                            </Text>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const StatCard = ({ title, value, percentage }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardPercentage}>{percentage}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#3b5998' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
    card: { backgroundColor: '#4c669f', padding: 10, borderRadius: 8, alignItems: 'center', width: '23%' },
    cardTitle: { color: '#fff', fontWeight: 'bold' },
    cardValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    cardPercentage: { color: '#fff' },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    alertRow: { backgroundColor: 'rgba(255, 0, 0, 0.2)' },
    studentName: { color: '#fff', flex: 1 }
});

export default WeeklyReportScreen;
