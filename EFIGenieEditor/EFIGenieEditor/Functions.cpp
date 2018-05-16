#include "Functions.h"

std::vector<std::string> Split(std::string s, char delim) {
	std::stringstream ss(s);
	std::string item;
	std::vector<std::string> tokens;
	while (getline(ss, item, delim)) {
		tokens.push_back(item);
	}
	return tokens;
}
unsigned int SizeOfType(std::string type)
{
	if (type == "uint8")
		return sizeof(unsigned char);
	if (type == "int8")
		return sizeof(char);
	if (type == "uint16")
		return sizeof(unsigned short);
	if (type == "int16")
		return sizeof(short);
	if (type == "uint32")
		return sizeof(unsigned int);
	if (type == "int32")
		return sizeof(int);
	if (type == "uint64")
		return sizeof(unsigned long);
	if (type == "int64")
		return sizeof(long);
	if (type == "float32")
		return sizeof(float);
	if (type == "float64")
		return sizeof(double);
	return 0;
}
template <typename T>
void CopyDoubleToLocationType(void *pos, void *number)
{
	*((T*)pos) = (T)(*((double *)number));
}
void CopyDoubleToLocationType(std::string type, void *pos, void *number)
{
	if (type == "uint8")
		CopyDoubleToLocationType<unsigned char>(pos, number);
	if (type == "int8")
		CopyDoubleToLocationType<char>(pos, number);
	if (type == "uint16")
		CopyDoubleToLocationType<unsigned short>(pos, number);
	if (type == "int16")
		CopyDoubleToLocationType<short>(pos, number);
	if (type == "uint32")
		CopyDoubleToLocationType<unsigned int>(pos, number);
	if (type == "int32")
		CopyDoubleToLocationType<int>(pos, number);
	if (type == "uint64")
		CopyDoubleToLocationType<unsigned long>(pos, number);
	if (type == "int64")
		CopyDoubleToLocationType<long>(pos, number);
	if (type == "float32")
		CopyDoubleToLocationType<float>(pos, number);
	if (type == "float64")
		CopyDoubleToLocationType<double>(pos, number);
}

template <typename T>
void CopyTypeToLocationDouble(void *pos, void *number)
{
	*((double*)pos) = (double)(*((T *)number));
}
void CopyTypeToLocationDouble(std::string type, void *pos, void *number)
{
	if (type == "uint8")
		CopyTypeToLocationDouble<unsigned char>(pos, number);
	if (type == "int8")
		CopyTypeToLocationDouble<char>(pos, number);
	if (type == "uint16")
		CopyTypeToLocationDouble<unsigned short>(pos, number);
	if (type == "int16")
		CopyTypeToLocationDouble<short>(pos, number);
	if (type == "uint32")
		CopyTypeToLocationDouble<unsigned int>(pos, number);
	if (type == "int32")
		CopyTypeToLocationDouble<int>(pos, number);
	if (type == "uint64")
		CopyTypeToLocationDouble<unsigned long>(pos, number);
	if (type == "int64")
		CopyTypeToLocationDouble<long>(pos, number);
	if (type == "float32")
		CopyTypeToLocationDouble<float>(pos, number);
	if (type == "float64")
		CopyTypeToLocationDouble<double>(pos, number);
}

int getAccuracy(double minNum, double maxNum)
{
	int maxLog = log(maxNum);
	int l = 3 - maxLog;
	if (l > 0)
		return l;
	return 0;
}