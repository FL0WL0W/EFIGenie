#include "stdint.h"

#ifndef PINDIRECTION_H
#define PINDIRECTION_H
namespace HardwareAbstraction
{
	enum PinDirection : uint8_t
	{
		In = 0,
		Out = 1
	};
}
#endif
