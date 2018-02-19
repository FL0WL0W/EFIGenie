namespace EngineManagement
{
	class MockPistonEngineIgnitionConfig : public IPistonEngineIgnitionConfig
	{
	public:
		MOCK_METHOD0(GetIgnitionTiming, IgnitionTiming());
	};
}