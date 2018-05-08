#include <string>
#include <vector>
#include <sstream>

#ifndef Functions_H
#define Functions_H
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
	return 0;
}
template <typename T>
void CopyNumberToLocation(void *pos, void *number)
{
	*((T*)pos) = (T)(*((double *)number));
}
#endif