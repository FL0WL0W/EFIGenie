
#include "Packed.h"

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