
#include "Packed.h"
#include "stdint.h"

#ifndef RELUCTORRESULT_H
#define RELUCTORRESULT_H
namespace Operations
{
    PACK(struct ReluctorResult
    {
        float Position;
        float PositionDot;
		uint32_t CalculatedTick;
        bool Synced;
    });
}
#endif