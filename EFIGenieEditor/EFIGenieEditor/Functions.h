#include <string>
#include <vector>
#include <sstream>
#include <QTableWidget>
#include <QHeaderView>

#ifndef Functions_H
#define Functions_H
std::vector<std::string> Split(std::string s, char delim);

unsigned int SizeOfType(std::string type);

template <typename T>
void CopyDoubleToLocationType(void *pos, void *number);

void CopyDoubleToLocationType(std::string type, void *pos, void *number);

template <typename T>
void CopyTypeToLocationDouble(void *pos, void *number);

void CopyTypeToLocationDouble(std::string type, void *pos, void *number);

int getAccuracy(double minNum, double maxNum);
#endif